# Orçamento App

Aplicativo Expo para clientes, orçamentos, pedidos e pagamentos, acompanhado por três APIs FastAPI: Core (8000), Pedidos (8001) e Pagamentos (8002). Os dados de negócio e comércio ficam separados em PostgreSQL e todas as consultas são isoladas por empresa.

## Configuração

1. Copie `.env.example` para `.env` e substitua `192.168.1.10` pelo IP LAN do computador que executa as APIs. Em celular físico, não use `localhost`.
2. Copie `backend/.env.example` para `backend/.env` e preencha credenciais e segredos próprios.
3. Instale o aplicativo com `npm install` e execute `npx expo start`.
4. Com o ambiente virtual do backend ativo, aplique as migrações e carregue a base inicial conforme os scripts em `backend/database`.

Para subir PostgreSQL e as APIs em Docker:

```bash
docker compose up --build
docker compose --profile seed run --rm seed
```

## Serviços

- Core API: `uvicorn backend.api.core_api.main:app --host 0.0.0.0 --port 8000`
- Order API: `uvicorn backend.api.order_api.main:app --host 0.0.0.0 --port 8001`
- Payment API: `uvicorn backend.api.payment_api.main:app --host 0.0.0.0 --port 8002`
- Product API: execute `docker compose -f ../api-ingestion/docker-compose.yml up --build` na raiz do repositório; por padrão fica em `http://localhost:8050`.

Cada serviço oferece documentação interativa em `/docs`. O app mantém o JWT no armazenamento seguro nativo e o valida em `/auth/me` ao iniciar.

## Validação

```bash
npx tsc --noEmit
PYTHONPATH=. backend/.venv/bin/pytest -q
```

Os mocks só são usados quando `EXPO_PUBLIC_USE_MOCKS=true`. Fora desse modo, falhas de rede são apresentadas na interface e não são substituídas silenciosamente por dados locais.
