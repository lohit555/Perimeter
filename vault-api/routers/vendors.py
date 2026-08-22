from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from auth import require_api_key
from db import get_session
from models import Vendor
from schemas import VendorCreate, VendorRead

router = APIRouter(dependencies=[Depends(require_api_key)])


@router.post("/vendors", response_model=VendorRead, status_code=status.HTTP_201_CREATED)
async def create_vendor(payload: VendorCreate, session: AsyncSession = Depends(get_session)) -> Vendor:
    existing = (
        await session.execute(select(Vendor).where(Vendor.domain == payload.domain))
    ).scalars().first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Vendor domain already exists")

    vendor = Vendor(**payload.model_dump())
    session.add(vendor)
    await session.commit()
    await session.refresh(vendor)
    return vendor
