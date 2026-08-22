import secrets
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from auth import require_api_key
from crypto import decrypt_token, encrypt_token
from db import get_session
from models import Token, Vendor
from schemas import TokenCreate, TokenListItem, TokenReveal, TokenRead

router = APIRouter(dependencies=[Depends(require_api_key)])


def _generate_raw_value() -> str:
    return "".join(secrets.choice("0123456789") for _ in range(16))


async def issue_token(
    session: AsyncSession, vendor_id: UUID, monthly_limit: float, recurring: bool = False
) -> Token:
    raw_value = _generate_raw_value()
    token = Token(
        vendor_id=vendor_id,
        encrypted_value=encrypt_token(raw_value),
        masked_value=f"•••• {raw_value[-4:]}",
        monthly_limit=monthly_limit,
        recurring=recurring,
    )
    session.add(token)
    await session.commit()
    await session.refresh(token)
    return token


@router.post("/tokens", response_model=TokenRead, status_code=status.HTTP_201_CREATED)
async def create_token(payload: TokenCreate, session: AsyncSession = Depends(get_session)) -> Token:
    vendor = await session.get(Vendor, payload.vendor_id)
    if not vendor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found")

    return await issue_token(session, payload.vendor_id, payload.monthly_limit, payload.recurring)


@router.get("/tokens", response_model=List[TokenListItem])
async def list_tokens(
    domain: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
    session: AsyncSession = Depends(get_session),
) -> List[TokenListItem]:
    query = select(Token, Vendor).join(Vendor, Token.vendor_id == Vendor.id)
    if domain:
        query = query.where(Vendor.domain == domain)
    if status:
        query = query.where(Token.status == status)

    rows = (await session.execute(query)).all()
    return [
        TokenListItem(
            id=token.id,
            vendor_id=vendor.id,
            vendor_name=vendor.name,
            vendor_domain=vendor.domain,
            masked_value=token.masked_value,
            status=token.status,
            recurring=token.recurring,
            monthly_limit=token.monthly_limit,
            spent=token.spent,
            issued_at=token.issued_at,
            last_used_at=token.last_used_at,
        )
        for token, vendor in rows
    ]


@router.post("/tokens/{token_id}/revoke", response_model=TokenRead)
async def revoke_token(token_id: UUID, session: AsyncSession = Depends(get_session)) -> Token:
    token = await session.get(Token, token_id)
    if not token:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Token not found")
    if token.status == "revoked":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Token already revoked")

    token.status = "revoked"
    session.add(token)
    await session.commit()
    await session.refresh(token)
    return token


@router.get("/tokens/{token_id}/reveal", response_model=TokenReveal)
async def reveal_token(token_id: UUID, session: AsyncSession = Depends(get_session)) -> TokenReveal:
    token = await session.get(Token, token_id)
    if not token:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Token not found")
    if token.status != "active":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=f"Token is {token.status}, cannot reveal"
        )

    print(f"[token-reveal] token_id={token.id}")
    return TokenReveal(id=token.id, value=decrypt_token(token.encrypted_value))
