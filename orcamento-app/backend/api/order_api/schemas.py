from typing import List, Optional
from pydantic import BaseModel, Field


class OrderItemResponse(BaseModel):
    id: str
    productId: str
    external_product_id: str
    productName: str
    product_name: str
    quantity: float
    unitPrice: float
    unit_price: float
    subtotal: float


class OrderResponse(BaseModel):
    id: str
    number: str
    clientName: str
    client_name: str
    quoteId: str
    quote_id: str
    total: float
    status: str
    createdAt: str
    created_at: str
    items: List[OrderItemResponse] = []


class OrderStatusUpdate(BaseModel):
    status: str = Field(..., description="Novo status do pedido")
