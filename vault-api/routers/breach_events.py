from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from auth import require_api_key
from db import get_session
from models import BreachEvent, Token, Vendor
from routers.tokens import issue_token
from schemas import BreachEventCreate, BreachEventRead, BreachEventResponse, Rotation

router = APIRouter(dependencies=[Depends(require_api_key)])


@router.post("/breach-events", response_model=BreachEventResponse, status_code=status.HTTP_201_CREATED)
async def create_breach_event(
    payload: BreachEventCreate, session: AsyncSession = Depends(get_session)
) -> BreachEventResponse:
    vendor = await session.get(Vendor, payload.vendor_id)
    if not vendor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found")

    breach_event = BreachEvent(vendor_id=vendor.id, description=payload.description)
    session.add(breach_event)
    await session.commit()
    await session.refresh(breach_event)

    rotations: list[Rotation] = []
    if payload.auto_rotate:
        active_tokens = (
            await session.execute(
                select(Token).where(Token.vendor_id == vendor.id, Token.status == "active")
            )
        ).scalars().all()

        for token in active_tokens:
            token.status = "revoked"
            session.add(token)
            await session.commit()

            new_token = await issue_token(session, vendor.id, token.monthly_limit, token.recurring)
            rotations.append(Rotation(old_token_id=token.id, new_token_id=new_token.id))

    return BreachEventResponse(
        breach_event=BreachEventRead.model_validate(breach_event, from_attributes=True),
        rotations=rotations,
    )
