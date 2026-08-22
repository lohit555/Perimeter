from datetime import datetime, timezone
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import Column, DateTime
from sqlmodel import Field, SQLModel


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _tz_column(*, nullable: bool = False) -> Column:
    return Column(DateTime(timezone=True), nullable=nullable)


class Vendor(SQLModel, table=True):
    __tablename__ = "vendor"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    domain: str = Field(unique=True, index=True)
    descriptor: str
    logo_color: Optional[str] = None
    initials: Optional[str] = None
    created_at: datetime = Field(default_factory=utcnow, sa_column=_tz_column())


class Token(SQLModel, table=True):
    __tablename__ = "token"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    vendor_id: UUID = Field(foreign_key="vendor.id", index=True)
    encrypted_value: str
    masked_value: str
    status: str = Field(default="active")
    recurring: bool = Field(default=False)
    monthly_limit: float = Field(default=0)
    spent: float = Field(default=0)
    issued_at: datetime = Field(default_factory=utcnow, sa_column=_tz_column())
    last_used_at: Optional[datetime] = Field(default=None, sa_column=_tz_column(nullable=True))
    one_time_use: bool = Field(default=False)
    expires_at: Optional[datetime] = Field(default=None, sa_column=_tz_column(nullable=True))
    locked_by_emergency: bool = Field(default=False)


class Transaction(SQLModel, table=True):
    __tablename__ = "transaction"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    token_id: UUID = Field(foreign_key="token.id", index=True)
    amount: float
    source_domain: str
    status: str
    reason: Optional[str] = None
    created_at: datetime = Field(default_factory=utcnow, sa_column=_tz_column())


class BreachEvent(SQLModel, table=True):
    __tablename__ = "breach_event"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    vendor_id: UUID = Field(foreign_key="vendor.id", index=True)
    description: str
    detected_at: datetime = Field(default_factory=utcnow, sa_column=_tz_column())
    resolved: bool = Field(default=False)
    resolved_at: Optional[datetime] = Field(default=None, sa_column=_tz_column(nullable=True))


class AuditEvent(SQLModel, table=True):
    __tablename__ = "audit_event"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    breach_event_id: Optional[UUID] = Field(default=None, foreign_key="breach_event.id", index=True)
    label: str
    detail: str
    done: bool = Field(default=True)
    created_at: datetime = Field(default_factory=utcnow, sa_column=_tz_column())
