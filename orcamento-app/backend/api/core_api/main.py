from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.core_api.routers import (
    auth,
    companies,
    users,
    clients,
    quotes,
    dashboard,
    history,
    internal,
)

app = FastAPI(
    title="Core API - Orçamento App",
    description="API responsável por autenticação, empresas, usuários, clientes, orçamentos e dashboard.",
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
app.include_router(auth.router)
app.include_router(companies.router)
app.include_router(users.router)
app.include_router(clients.router)
app.include_router(quotes.router)
app.include_router(dashboard.router)
app.include_router(history.router)
app.include_router(internal.router)


@app.get("/health", tags=["Saúde"])
def health_check():
    return {"status": "ok", "service": "core_api"}
