from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from auth import require_api_key
from db import get_session
from models import Token, Transaction, Vendor, utcnow
from schemas import TransactionCreate, TransactionRead

router = APIRouter(dependencies=[Depends(require_api_key)])


def _domain_matches(source_domain: str, vendor_domain: str) -> bool:
    source_domain = source_domain.lower().strip()
    vendor_domain = vendor_domain.lower().strip()
    return source_domain == vendor_domain or source_domain.endswith(f".{vendor_domain}")


@router.post("/transactions", response_model=TransactionRead, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    payload: TransactionCreate, session: AsyncSession = Depends(get_session)
) -> Transaction:
    token = await session.get(Token, payload.token_id)
    if not token:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Token not found")

    vendor = await session.get(Vendor, token.vendor_id)

    reason = None
    if token.status != "active":
        reason = f"token is {token.status}"
    elif token.expires_at is not None and utcnow() > token.expires_at:
        reason = "token expired"
        token.status = "revoked"
        session.add(token)
    elif not _domain_matches(payload.source_domain, vendor.domain):
        reason = f"charge from untrusted domain {payload.source_domain}"
    elif token.spent + payload.amount > token.monthly_limit:
        reason = "monthly limit exceeded"

    txn_status = "flagged" if reason else "clear"

    transaction = Transaction(
        token_id=token.id,
        amount=payload.amount,
        source_domain=payload.source_domain,
        status=txn_status,
        reason=reason,
    )
    session.add(transaction)

    if txn_status == "clear":
        token.spent += payload.amount
        token.last_used_at = transaction.created_at
        if token.one_time_use:
            token.status = "revoked"
        session.add(token)

    await session.commit()
    await session.refresh(transaction)
    return transaction
