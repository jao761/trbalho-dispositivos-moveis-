import pytest
from unittest.mock import patch
import httpx
from fastapi.testclient import TestClient

from backend.api.core_api.main import app as core_app
from backend.api.order_api.main import app as order_app

core_client = TestClient(core_app)
order_client = TestClient(order_app)


@pytest.fixture(autouse=True)
def route_internal_order_api():
    orig_client = httpx.AsyncClient
    def custom_client(*args, **kwargs):
        return orig_client(transport=httpx.ASGITransport(app=order_app), base_url="http://127.0.0.1:8001")
        
    with patch("backend.api.core_api.routers.dashboard.httpx.AsyncClient", side_effect=custom_client):
        yield


@pytest.fixture(scope="module")
def auth_token_a():
    res = core_client.post("/auth/login", json={"email": "joao@ferragenssilva.com.br", "password": "123456"})
    assert res.status_code == 200
    return res.json()["token"]


def test_dashboard_aggregation(auth_token_a):
    headers = {"Authorization": f"Bearer {auth_token_a}"}
    res = core_client.get("/dashboard", headers=headers)
    assert res.status_code == 200
    data = res.json()

    # Verifica estrutura exigida pelo frontend
    assert "salesTotal" in data
    assert "quoteCount" in data
    assert "approvedCount" in data
    assert "pendingCount" in data
    assert "rejectedCount" in data
    assert "salesByMonth" in data
    assert isinstance(data["salesByMonth"], list)
    assert len(data["salesByMonth"]) > 0


def test_audit_history(auth_token_a):
    headers = {"Authorization": f"Bearer {auth_token_a}"}
    res = core_client.get("/history", headers=headers)
    assert res.status_code == 200
    items = res.json()
    assert isinstance(items, list)
