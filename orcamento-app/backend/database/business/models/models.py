import uuid
from sqlalchemy import (
    Column,
    String,
    Text,
    DateTime,
    Date,
    Numeric,
    ForeignKey,
    UniqueConstraint,
    Index,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from backend.database.business.connection import Base
from backend.shared.utils.date_utils import utc_now


class Company(Base):
    __tablename__ = "companies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    cnpj = Column(String(30), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    users = relationship("CompanyUser", back_populates="company", cascade="all, delete-orphan")
    clients = relationship("Client", back_populates="company", cascade="all, delete-orphan")
    quotes = relationship("Quote", back_populates="company", cascade="all, delete-orphan")


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    companies = relationship("CompanyUser", back_populates="user", cascade="all, delete-orphan")
    created_quotes = relationship("Quote", back_populates="created_by")


class CompanyUser(Base):
    __tablename__ = "company_users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(50), nullable=False, default="ADMIN")  # ADMIN, MANAGER, SELLER
    created_at = Column(DateTime, default=utc_now, nullable=False)

    company = relationship("Company", back_populates="users")
    user = relationship("User", back_populates="companies")

    __table_args__ = (
        UniqueConstraint("company_id", "user_id", name="uq_company_user"),
    )


class Client(Base):
    __tablename__ = "clients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    cpf_cnpj = Column(String(30), nullable=True)
    address = Column(String(255), nullable=True)
    number = Column(String(50), nullable=True)
    complement = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)
    deleted_at = Column(DateTime, nullable=True)

    company = relationship("Company", back_populates="clients")
    quotes = relationship("Quote", back_populates="client", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_clients_company_id", "company_id"),
        Index("ix_clients_company_name", "company_id", "name"),
    )


class Quote(Base):
    __tablename__ = "quotes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    created_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    number = Column(String(50), nullable=False)
    valid_until = Column(Date, nullable=True)
    subtotal = Column(Numeric(12, 2), nullable=False, default=0)
    discount = Column(Numeric(12, 2), nullable=False, default=0)
    total = Column(Numeric(12, 2), nullable=False, default=0)
    status = Column(String(30), nullable=False, default="DRAFT")  # DRAFT, SENT, APPROVED, REJECTED, EXPIRED
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    company = relationship("Company", back_populates="quotes")
    client = relationship("Client", back_populates="quotes")
    created_by = relationship("User", back_populates="created_quotes")
    items = relationship("QuoteItem", back_populates="quote", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("company_id", "number", name="uq_quote_company_number"),
        Index("ix_quotes_company_id", "company_id"),
        Index("ix_quotes_company_status", "company_id", "status"),
        Index("ix_quotes_company_client", "company_id", "client_id"),
        Index("ix_quotes_company_created_at", "company_id", "created_at"),
    )


class QuoteItem(Base):
    __tablename__ = "quote_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quote_id = Column(UUID(as_uuid=True), ForeignKey("quotes.id", ondelete="CASCADE"), nullable=False)
    external_product_id = Column(String(100), nullable=False)
    product_name = Column(String(255), nullable=False)
    quantity = Column(Numeric(10, 2), nullable=False, default=1)
    unit_price = Column(Numeric(12, 2), nullable=False, default=0)
    discount = Column(Numeric(12, 2), nullable=False, default=0)
    subtotal = Column(Numeric(12, 2), nullable=False, default=0)

    quote = relationship("Quote", back_populates="items")

    __table_args__ = (
        Index("ix_quote_items_quote_id", "quote_id"),
    )


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), nullable=False)
    user_id = Column(UUID(as_uuid=True), nullable=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(100), nullable=True)
    entity_id = Column(String(100), nullable=True)
    metadata_ = Column("metadata", JSONB, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    __table_args__ = (
        Index("ix_audit_logs_company_created_at", "company_id", "created_at"),
    )
