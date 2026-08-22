from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel


class VendorCreate(BaseModel):
    name: str
    domain: str
    descriptor: str
    logo_color: Optional[str] = None
    initials: Optional[str] = None


class VendorRead(BaseModel):
    id: UUID
    name: str
    domain: str
    descriptor: str
    logo_color: Optional[str]
    initials: Optional[str]
    created_at: datetime


class TokenCreate(BaseModel):
    vendor_id: UUID
    monthly_limit: float
    recurring: bool = False


class TokenRead(BaseModel):
    id: UUID
    vendor_id: UUID
    masked_value: str
    status: str
    recurring: bool
    monthly_limit: float
    spent: float
    issued_at: datetime
    last_used_at: Optional[datetime]


class TokenReveal(BaseModel):
    id: UUID
    value: str


class TokenListItem(BaseModel):
    id: UUID
    vendor_id: UUID
    vendor_name: str
    vendor_domain: str
    masked_value: str
    status: str
    recurring: bool
    monthly_limit: float
    spent: float
    issued_at: datetime
    last_used_at: Optional[datetime]


class TransactionCreate(BaseModel):
    token_id: UUID
    amount: float
    source_domain: str


class TransactionRead(BaseModel):
    id: UUID
    token_id: UUID
    amount: float
    source_domain: str
    status: str
    reason: Optional[str]
    created_at: datetime


class BreachEventCreate(BaseModel):
    vendor_id: UUID
    description: str
    auto_rotate: bool = True


class BreachEventRead(BaseModel):
    id: UUID
    vendor_id: UUID
    description: str
    detected_at: datetime
    resolved: bool
    resolved_at: Optional[datetime]


class Rotation(BaseModel):
    old_token_id: UUID
    new_token_id: UUID


class BreachEventResponse(BaseModel):
    breach_event: BreachEventRead
    rotations: List[Rotation]


class LedgerMerchant(BaseModel):
    id: UUID
    name: str
    domain: str
    logo_color: Optional[str]
    initials: Optional[str]
    masked_token: str
    status: str
    risk: str
    recurring: bool
    monthly_limit: float
    spent: float
    last_used_at: Optional[datetime]


class LedgerActivityEvent(BaseModel):
    id: UUID
    type: str
    merchant: str
    detail: str
    time: datetime


class LedgerResponse(BaseModel):
    merchants: List[LedgerMerchant]
    activity: List[LedgerActivityEvent]


class AuditEventCreate(BaseModel):
    breach_event_id: Optional[UUID] = None
    label: str
    detail: str
    done: bool = True


class AuditEventRead(BaseModel):
    id: UUID
    breach_event_id: Optional[UUID]
    label: str
    detail: str
    done: bool
    created_at: datetime
