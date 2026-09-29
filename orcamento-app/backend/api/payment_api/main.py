from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.payment_api.routers import payments, webhooks

app = FastAPI(
    title="Payment API - Orçamento App",
    description="API responsável por pagamentos, liquidação de pedidos e webhooks de gateways.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configuração de CORS para compatibilidade total com Expo Go e Web
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusão dos roteadores
app.include_router(payments.router)
app.include_router(webhooks.router)


@app.get("/health", tags=["Saúde"])
def health_check():
    return {"status": "ok", "service": "payment_api"}
