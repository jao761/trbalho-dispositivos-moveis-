from datetime import date, datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, ConfigDict, EmailStr, Field


# --- Auth Schemas ---
class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, description="Nome do usuário")
    email: EmailStr = Field(..., description="E-mail de acesso")
    password: str = Field(..., min_length=6, description="Senha de acesso")
    passwordConfirmation: Optional[str] = Field(None, description="Confirmação da senha")
    company_name: str = Field(..., min_length=2, description="Nome da empresa")


class LoginRequest(BaseModel):
    usernameOrEmail: Optional[str] = Field(None, description="E-mail ou nome de usuário")
    email: Optional[str] = Field(None, description="E-mail")
    password: str = Field(..., min_length=1, description="Senha")


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    initials: str
    role: str = "ADMIN"


class CompanyResponse(BaseModel):
    id: str
    name: str
    cnpj: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


class AuthResponse(BaseModel):
    token: str
    token_type: str = "Bearer"
    user: UserResponse
    company: CompanyResponse


# --- Client Schemas ---
class ClientCreate(BaseModel):
    name: str
    document: Optional[str] = Field(None, alias="cpf_cnpj")
    cpf_cnpj: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    number: Optional[str] = None
    complement: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True)


class ClientUpdate(BaseModel):
    name: Optional[str] = None
    document: Optional[str] = Field(None, alias="cpf_cnpj")
    cpf_cnpj: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    number: Optional[str] = None
    complement: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True)


class ClientResponse(BaseModel):
    id: str
    name: str
    email: Optional[str] = ""
    phone: Optional[str] = ""
    document: Optional[str] = ""
    cpf_cnpj: Optional[str] = ""
    address: Optional[str] = ""
    number: Optional[str] = ""
    complement: Optional[str] = ""
    city: Optional[str] = ""
    state: Optional[str] = ""
    lastQuoteValue: float = 0.0
    quoteCount: int = 0
    totalValue: float = 0.0


# --- Quote Item Schemas ---
class QuoteItemCreate(BaseModel):
    productId: Optional[str] = Field(None, alias="external_product_id")
    external_product_id: Optional[str] = None
    productName: Optional[str] = Field(None, alias="product_name")
    product_name: Optional[str] = None
    quantity: float = 1.0
    unitPrice: Optional[float] = Field(None, alias="unit_price")
    unit_price: Optional[float] = None
    discount: float = 0.0

    model_config = ConfigDict(populate_by_name=True)


class QuoteItemResponse(BaseModel):
    id: str
    productId: str
    external_product_id: str
    productName: str
    product_name: str
    quantity: float
    unitPrice: float
    unit_price: float
    discount: float
    subtotal: float


# --- Quote Schemas ---
class QuoteCreate(BaseModel):
    clientId: Optional[str] = Field(None, alias="client_id")
    client_id: Optional[str] = None
    number: Optional[str] = None
    validUntil: Optional[str] = Field(None, alias="valid_until")
    valid_until: Optional[str] = None
    discount: float = 0.0
    notes: Optional[str] = ""
    items: List[QuoteItemCreate] = []

    model_config = ConfigDict(populate_by_name=True)


class QuoteResponse(BaseModel):
    id: str
    number: str
    clientId: str
    client_id: str
    clientName: str
    client_name: str
    status: str
    createdAt: str
    created_at: str
    validUntil: str
    valid_until: str
    subtotal: float
    discount: float
    total: float
    notes: Optional[str] = ""
    items: List[QuoteItemResponse] = []


# --- Dashboard Schemas ---
class SalesMonth(BaseModel):
    label: str
    value: float


class DashboardResponse(BaseModel):
    salesTotal: float
    quoteCount: int
    approvedCount: int
    pendingCount: int
    rejectedCount: int
    clientsTotal: int
    averageTicket: float
    salesByMonth: List[SalesMonth]


# --- History Schemas ---
class HistoryItem(BaseModel):
    id: str
    date: str
    title: str
    detail: str
    tone: str  # primary, success, warning
