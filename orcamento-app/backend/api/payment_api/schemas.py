from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class PaymentCreate(BaseModel):
    order_id: str = Field(..., description="ID do pedido a ser pago")
    amount: Optional[float] = Field(None, description="Valor do pagamento. Se omitido, utiliza o total do pedido")
    payment_method: Optional[str] = Field("Pix", description="Método de pagamento (Pix, Boleto, Cartão)")
    provider: Optional[str] = Field("SIMULATED", description="Provedor do gateway de pagamento")


class PaymentResponse(BaseModel):
    id: str
    company_id: str
    order_id: str
    orderId: str
    order_number: str
    orderNumber: str
    provider: str
    external_payment_id: Optional[str] = None
    amount: float
    currency: str = "BRL"
    status: str
    payment_method: Optional[str] = "Pix"
    method: Optional[str] = "Pix"
    created_at: str
    createdAt: str
    updated_at: Optional[str] = None


class PaymentSimulateRequest(BaseModel):
    status: Optional[str] = Field("APPROVED", description="Novo status a simular: APPROVED ou REJECTED")


class WebhookPaymentPayload(BaseModel):
    provider: str = Field(..., description="Nome do provedor (ex: stripe, mercadopago, simulated)")
    external_event_id: str = Field(..., description="ID único do evento no provedor externo para idempotência")
    event_type: str = Field(..., description="Tipo do evento (ex: payment.succeeded, charge.failed)")
    order_id: Optional[str] = Field(None, description="ID do pedido associado")
    payment_id: Optional[str] = Field(None, description="ID interno do pagamento, se conhecido")
    external_payment_id: Optional[str] = Field(None, description="ID do pagamento no provedor externo")
    status: str = Field(..., description="Status do pagamento (APPROVED, REJECTED, REFUNDED, etc.)")
    payload: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Payload bruto recebido do webhook")
