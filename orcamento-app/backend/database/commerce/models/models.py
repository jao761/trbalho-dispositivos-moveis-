import uuid
from sqlalchemy import (
    Column,
    String,
    DateTime,
    Numeric,
    ForeignKey,
    UniqueConstraint,
    Index,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from backend.database.commerce.connection import Base
from backend.shared.utils.date_utils import utc_now


class Order(Base):
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), nullable=False)
    created_by_user_id = Column(UUID(as_uuid=True), nullable=False)
    quote_id = Column(UUID(as_uuid=True), nullable=False)
    number = Column(String(50), nullable=False)
    client_name = Column(String(255), nullable=False)
    external_order_id = Column(String(100), nullable=True)
    status = Column(
        String(50),
        nullable=False,
        default="PENDING"
    )  # PENDING, PAYMENT_PENDING, PAID, PROCESSING, SHIPPED, DELIVERED, CANCELLED
    total = Column(Numeric(12, 2), nullable=False, default=0)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("company_id", "number", name="uq_order_company_number"),
        Index("ix_orders_company_id", "company_id"),
        Index("ix_orders_company_status", "company_id", "status"),
        Index("ix_orders_company_created_at", "company_id", "created_at"),
        Index("ix_orders_quote_id", "quote_id"),
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    external_product_id = Column(String(100), nullable=False)
    product_name = Column(String(255), nullable=False)
    quantity = Column(Numeric(10, 2), nullable=False, default=1)
    unit_price = Column(Numeric(12, 2), nullable=False, default=0)
    subtotal = Column(Numeric(12, 2), nullable=False, default=0)

    order = relationship("Order", back_populates="items")

    __table_args__ = (
        Index("ix_order_items_order_id", "order_id"),
    )


class Payment(Base):
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), nullable=False)
    order_id = Column(UUID(as_uuid=True), nullable=False)
    order_number = Column(String(50), nullable=False)
    provider = Column(String(50), nullable=False, default="SIMULATED")
    external_payment_id = Column(String(100), nullable=True)
    amount = Column(Numeric(12, 2), nullable=False, default=0)
    currency = Column(String(3), nullable=False, default="BRL")
    status = Column(
        String(30),
        nullable=False,
        default="PENDING"
    )  # PENDING, APPROVED, REJECTED, REFUNDED, CANCELLED
    payment_method = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    events = relationship("PaymentEvent", back_populates="payment", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_payments_company_id", "company_id"),
        Index("ix_payments_order_id", "order_id"),
        Index("ix_payments_external_payment_id", "external_payment_id"),
    )


class PaymentEvent(Base):
    __tablename__ = "payment_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    payment_id = Column(UUID(as_uuid=True), ForeignKey("payments.id", ondelete="SET NULL"), nullable=True)
    provider = Column(String(50), nullable=False)
    external_event_id = Column(String(150), nullable=False)
    event_type = Column(String(100), nullable=False)
    payload = Column(JSONB, nullable=False)
    received_at = Column(DateTime, default=utc_now, nullable=False)
    processed_at = Column(DateTime, nullable=True)

    payment = relationship("Payment", back_populates="events")

    __table_args__ = (
        UniqueConstraint("provider", "external_event_id", name="uq_provider_event_id"),
        Index("ix_payment_events_external_event_id", "external_event_id"),
    )
