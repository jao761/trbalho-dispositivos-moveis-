from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.order_api.routers import orders, internal

app = FastAPI(
    title="Order API - Orçamento App",
    description="API responsável pela gestão de pedidos, itens de pedidos e conversão de orçamentos aprovados.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configuração de CORS para desenvolvimento com Expo Go
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusão dos roteadores
app.include_router(orders.router)
app.include_router(internal.router)


@app.get("/health", tags=["Saúde"])
def health_check():
    return {"status": "ok", "service": "order_api"}
