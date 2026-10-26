import pytest
from fastapi.testclient import TestClient

from backend.api.core_api.main import app as core_app
from backend.api.order_api.main import app as order_app
from backend.api.payment_api.main import app as payment_app

core_client = TestClient(core_app)
order_client = TestClient(order_app)
payment_client = TestClient(payment_app)


@pytest.fixture(autouse=True)
def route_internal_http():
    from unittest.mock import patch
    import httpx
    
    orig_client = httpx.AsyncClient
    def custom_async_client(*args, **kwargs):
        return orig_client(transport=httpx.ASGITransport(app=core_app), base_url="http://127.0.0.1:8000")
        
    with patch("backend.api.order_api.routers.orders.httpx.AsyncClient", side_effect=custom_async_client):
        yield


@pytest.fixture(scope="module")
def auth_tokens():
    # Login Usuário A (Empresa A: Ferragens Silva)
    res_a = core_client.post("/auth/login", json={"email": "joao@ferragenssilva.com.br", "password": "123456"})
    assert res_a.status_code == 200, f"Falha no login da Empresa A: {res_a.text}"
    token_a = res_a.json()["token"]

    # Login Usuário B (Empresa B: Construtora Souza)
    res_b = core_client.post("/auth/login", json={"email": "maria@construtorasouza.com.br", "password": "123456"})
    assert res_b.status_code == 200, f"Falha no login da Empresa B: {res_b.text}"
    token_b = res_b.json()["token"]

    return {"token_a": token_a, "token_b": token_b}


def test_clients_multi_tenant_isolation(auth_tokens):
    headers_a = {"Authorization": f"Bearer {auth_tokens['token_a']}"}
    headers_b = {"Authorization": f"Bearer {auth_tokens['token_b']}"}

    # 1. Usuário A cria um cliente exclusivo
    res = core_client.post(
        "/clients",
        json={"name": "Cliente Exclusivo Tenant A", "email": "exclusivo_a@teste.com", "phone": "11999990001"},
        headers=headers_a,
    )
    assert res.status_code == 201
    client_a_id = res.json()["id"]

    # 2. Usuário B lista clientes e NÃO deve ver o cliente de A
    res_list_b = core_client.get("/clients", headers=headers_b)
    assert res_list_b.status_code == 200
    clients_b_ids = [c["id"] for c in res_list_b.json()]
    assert client_a_id not in clients_b_ids, "Vazamento de dados multi-tenant: Usuário B enxergou cliente do Usuário A!"

    # 3. Usuário B tenta acessar diretamente o cliente de A por ID -> deve retornar 404
    res_get_b = core_client.get(f"/clients/{client_a_id}", headers=headers_b)
    assert res_get_b.status_code == 404, "Usuário B conseguiu acessar cliente de A diretamente!"


def test_quotes_multi_tenant_isolation(auth_tokens):
    headers_a = {"Authorization": f"Bearer {auth_tokens['token_a']}"}
    headers_b = {"Authorization": f"Bearer {auth_tokens['token_b']}"}

    # Obtém um cliente de A
    clients_a = core_client.get("/clients", headers=headers_a).json()
    assert len(clients_a) > 0
    client_id = clients_a[0]["id"]

    # Usuário A cria um orçamento
    quote_payload = {
        "client_id": client_id,
        "discount": 50.0,
        "notes": "Orçamento confidencial da Empresa A",
        "items": [
            {"product_name": "Tubo de Aço Galvanizado", "quantity": 10, "unit_price": 45.0, "external_product_id": "prod-tubo-01"}
        ],
    }
    res_quote = core_client.post("/quotes", json=quote_payload, headers=headers_a)
    assert res_quote.status_code == 201
    quote_a = res_quote.json()
    quote_id = quote_a["id"]

    # Verifica cálculo de subtotal e total
    assert quote_a["subtotal"] == 450.0
    assert quote_a["total"] == 400.0

    # Usuário B tenta acessar o orçamento de A -> deve retornar 404
    res_quote_b = core_client.get(f"/quotes/{quote_id}", headers=headers_b)
    assert res_quote_b.status_code == 404, "Usuário B acessou orçamento do Usuário A!"


def test_order_creation_from_quote_and_isolation(auth_tokens):
    headers_a = {"Authorization": f"Bearer {auth_tokens['token_a']}"}
    headers_b = {"Authorization": f"Bearer {auth_tokens['token_b']}"}

    # Cria e aprova um orçamento para a Empresa A
    clients_a = core_client.get("/clients", headers=headers_a).json()
    client_id = clients_a[0]["id"]

    quote_payload = {
        "client_id": client_id,
        "discount": 0.0,
        "notes": "Orçamento para conversão em pedido",
        "items": [
            {"product_name": "Furadeira de Impacto", "quantity": 2, "unit_price": 250.0, "external_product_id": "prod-furadeira-01"}
        ],
    }
    q_res = core_client.post("/quotes", json=quote_payload, headers=headers_a)
    assert q_res.status_code == 201
    q_id = q_res.json()["id"]

    # Aprova o orçamento
    appr_res = core_client.post(f"/quotes/{q_id}/approve", headers=headers_a)
    assert appr_res.status_code == 200
    assert appr_res.json()["status"] in ["APPROVED", "APROVADO"]

    # Usuário B tenta gerar pedido a partir do orçamento de A -> deve ser proibido
    order_b_res = order_client.post(f"/orders/from-quote/{q_id}", headers=headers_b)
    assert order_b_res.status_code in [403, 404], "Usuário B conseguiu converter orçamento do Usuário A!"

    # Usuário A converte o orçamento aprovado em pedido
    order_a_res = order_client.post(f"/orders/from-quote/{q_id}", headers=headers_a)
    assert order_a_res.status_code == 201, f"Falha ao gerar pedido: {order_a_res.text}"
    order_a = order_a_res.json()
    assert order_a["total"] == 500.0
    assert len(order_a["items"]) == 1
    assert order_a["items"][0]["productName"] == "Furadeira de Impacto"


def test_payment_and_webhook_idempotency(auth_tokens):
    headers_a = {"Authorization": f"Bearer {auth_tokens['token_a']}"}
    headers_b = {"Authorization": f"Bearer {auth_tokens['token_b']}"}

    # Pega os pedidos de A
    orders_a = order_client.get("/orders", headers=headers_a).json()
    assert len(orders_a) > 0
    order_a = orders_a[0]
    order_id = order_a["id"]

    # Usuário B tenta criar pagamento para o pedido de A -> deve ser barrado
    pay_b_res = payment_client.post("/payments", json={"order_id": order_id}, headers=headers_b)
    assert pay_b_res.status_code in [403, 404], "Usuário B conseguiu criar pagamento para pedido de A!"

    # Usuário A cria cobrança/pagamento para o pedido
    pay_a_res = payment_client.post("/payments", json={"order_id": order_id, "payment_method": "Pix"}, headers=headers_a)
    assert pay_a_res.status_code == 201
    payment = pay_a_res.json()
    payment_id = payment["id"]

    # Teste de Webhook Idempotente
    event_id = f"evt_test_unique_{payment_id[:8]}"
    webhook_payload = {
        "provider": "mercadopago",
        "external_event_id": event_id,
        "event_type": "payment.succeeded",
        "payment_id": payment_id,
        "status": "APPROVED",
        "payload": {"fee": 1.50},
    }

    # Primeiro envio do Webhook -> deve processar
    w_res1 = payment_client.post("/webhooks/payment", json=webhook_payload)
    assert w_res1.status_code == 200
    assert w_res1.json()["status"] == "processed"

    # Verifica se o pedido foi atualizado para PAID
    ord_check = order_client.get(f"/orders/{order_id}", headers=headers_a).json()
    assert ord_check["status"] in ["PAID", "PAGO"]

    # Segundo envio do MESMO Webhook (idêntico provider e external_event_id) -> deve ignorar com segurança
    w_res2 = payment_client.post("/webhooks/payment", json=webhook_payload)
    assert w_res2.status_code == 200
    assert w_res2.json()["status"] == "ignored"
    assert w_res2.json()["reason"] == "duplicate_event"
