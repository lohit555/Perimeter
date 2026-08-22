from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from auth import require_api_key
from db import get_session
from models import AuditEvent, Token
from schemas import EmergencyLockResponse, EmergencyLockResumeResponse

router = APIRouter(dependencies=[Depends(require_api_key)])


@router.post(
    "/emergency-lock", response_model=EmergencyLockResponse, status_code=status.HTTP_201_CREATED
)
async def emergency_lock(session: AsyncSession = Depends(get_session)) -> EmergencyLockResponse:
    active_tokens = (
        await session.execute(select(Token).where(Token.status == "active"))
    ).scalars().all()

    for token in active_tokens:
        token.status = "paused"
        token.locked_by_emergency = True
        session.add(token)

    session.add(
        AuditEvent(
            label="Emergency Lock Activated",
            detail=f"{len(active_tokens)} token(s) paused.",
        )
    )

    await session.commit()

    return EmergencyLockResponse(
        locked_count=len(active_tokens),
        token_ids=[token.id for token in active_tokens],
    )


@router.post("/emergency-lock/resume", response_model=EmergencyLockResumeResponse)
async def emergency_lock_resume(
    session: AsyncSession = Depends(get_session),
) -> EmergencyLockResumeResponse:
    locked_tokens = (
        await session.execute(
            select(Token).where(
                Token.locked_by_emergency.is_(True), Token.status == "paused"
            )
        )
    ).scalars().all()

    for token in locked_tokens:
        token.status = "active"
        token.locked_by_emergency = False
        session.add(token)

    session.add(
        AuditEvent(
            label="Emergency Lock Resumed",
            detail=f"{len(locked_tokens)} token(s) resumed.",
        )
    )

    await session.commit()

    return EmergencyLockResumeResponse(
        resumed_count=len(locked_tokens),
        token_ids=[token.id for token in locked_tokens],
    )
