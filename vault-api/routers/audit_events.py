from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from auth import require_api_key
from db import get_session
from models import AuditEvent, BreachEvent
from schemas import AuditEventCreate, AuditEventRead

router = APIRouter(dependencies=[Depends(require_api_key)])


@router.post("/audit-events", response_model=AuditEventRead, status_code=status.HTTP_201_CREATED)
async def create_audit_event(
    payload: AuditEventCreate, session: AsyncSession = Depends(get_session)
) -> AuditEvent:
    if payload.breach_event_id is not None:
        breach_event = await session.get(BreachEvent, payload.breach_event_id)
        if not breach_event:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Breach event not found")

    audit_event = AuditEvent(**payload.model_dump())
    session.add(audit_event)
    await session.commit()
    await session.refresh(audit_event)
    return audit_event


@router.get("/audit-events", response_model=List[AuditEventRead])
async def list_audit_events(
    breach_event_id: Optional[UUID] = Query(default=None),
    session: AsyncSession = Depends(get_session),
) -> List[AuditEvent]:
    query = select(AuditEvent).order_by(AuditEvent.created_at.asc())
    if breach_event_id:
        query = query.where(AuditEvent.breach_event_id == breach_event_id)

    return (await session.execute(query)).scalars().all()
