from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from auth import require_api_key
from db import get_session
from models import BreachEvent, Token, Transaction, Vendor
from schemas import LedgerActivityEvent, LedgerMerchant, LedgerResponse

router = APIRouter(dependencies=[Depends(require_api_key)])


@router.get("/ledger", response_model=LedgerResponse)
async def get_ledger(
    vendor_id: Optional[UUID] = Query(default=None),
    status: Optional[str] = Query(default=None),
    session: AsyncSession = Depends(get_session),
) -> LedgerResponse:
    token_query = select(Token, Vendor).join(Vendor, Token.vendor_id == Vendor.id)
    if vendor_id:
        token_query = token_query.where(Token.vendor_id == vendor_id)
    if status:
        token_query = token_query.where(Token.status == status)

    token_rows = (await session.execute(token_query)).all()

    merchants = []
    for token, vendor in token_rows:
        flagged = (
            await session.execute(
                select(Transaction).where(
                    Transaction.token_id == token.id, Transaction.status == "flagged"
                )
            )
        ).scalars().all()
        risk = "High" if len(flagged) >= 2 else "Medium" if flagged else "Low"

        merchants.append(
            LedgerMerchant(
                id=token.id,
                name=vendor.name,
                domain=vendor.domain,
                logo_color=vendor.logo_color,
                initials=vendor.initials,
                masked_token=token.masked_value,
                status=token.status,
                risk=risk,
                recurring=token.recurring,
                monthly_limit=token.monthly_limit,
                spent=token.spent,
                last_used_at=token.last_used_at,
            )
        )

    activity: list[LedgerActivityEvent] = []

    txn_rows = (
        await session.execute(
            select(Transaction, Token, Vendor)
            .join(Token, Transaction.token_id == Token.id)
            .join(Vendor, Token.vendor_id == Vendor.id)
            .order_by(Transaction.created_at.desc())
            .limit(50)
        )
    ).all()
    for txn, token, vendor in txn_rows:
        event_type = "blocked" if txn.status == "flagged" else "issued"
        detail = txn.reason or f"Charge of ${txn.amount:.2f} cleared"
        activity.append(
            LedgerActivityEvent(
                id=txn.id, type=event_type, merchant=vendor.name, detail=detail, time=txn.created_at
            )
        )

    breach_rows = (
        await session.execute(
            select(BreachEvent, Vendor)
            .join(Vendor, BreachEvent.vendor_id == Vendor.id)
            .order_by(BreachEvent.detected_at.desc())
            .limit(20)
        )
    ).all()
    for breach, vendor in breach_rows:
        activity.append(
            LedgerActivityEvent(
                id=breach.id,
                type="revoked",
                merchant=vendor.name,
                detail=breach.description,
                time=breach.detected_at,
            )
        )

    activity.sort(key=lambda e: e.time, reverse=True)

    return LedgerResponse(merchants=merchants, activity=activity)
