import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from httpx import AsyncClient, ASGITransport
import os

# Mock env vars before importing server
os.environ.setdefault("MONGO_URL", "mongodb://localhost:27017")
os.environ.setdefault("DB_NAME", "test_minbar")
os.environ.setdefault("API_SECRET", "test-secret-123")


@pytest.fixture(autouse=True)
def mock_mongo():
    """Patch the motor client so tests never touch a real database."""
    mock_db = MagicMock()

    def _make_collection():
        col = MagicMock()
        col.find = MagicMock(return_value=MagicMock(to_list=AsyncMock(return_value=[])))
        col.find_one = AsyncMock(return_value=None)
        col.insert_one = AsyncMock()
        col.update_one = AsyncMock()
        col.delete_one = AsyncMock(return_value=MagicMock(deleted_count=0))
        return col

    status_col = _make_collection()
    kv_col = _make_collection()

    # db.status_checks → status_col  (attribute access)
    mock_db.status_checks = status_col
    # db["kv_store"] or db.status_checks via __getitem__
    mock_db.__getitem__ = MagicMock(side_effect=lambda k: kv_col if k == "kv_store" else status_col)

    with patch("server.db", mock_db):
        yield mock_db


@pytest.fixture
def api_secret():
    return "test-secret-123"


def _headers(secret="test-secret-123"):
    return {"Authorization": f"Bearer {secret}"}


@pytest.mark.asyncio
async def test_root(mock_mongo):
    from server import app
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/")
    assert resp.status_code == 200
    assert resp.json() == {"message": "Hello World"}


@pytest.mark.asyncio
async def test_kv_get_requires_auth(mock_mongo):
    from server import app
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/kv/test-key")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_kv_get_wrong_secret(mock_mongo):
    from server import app
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/kv/test-key", headers=_headers("wrong"))
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_kv_list_requires_auth(mock_mongo):
    from server import app
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/kv")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_kv_put_requires_auth(mock_mongo):
    from server import app
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.put("/api/kv/test-key", json={"value": "hello"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_kv_delete_requires_auth(mock_mongo):
    from server import app
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.delete("/api/kv/test-key")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_status_create(mock_mongo):
    from server import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post("/api/status", json={"client_name": "test-client"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["client_name"] == "test-client"
    assert "id" in data


@pytest.mark.asyncio
async def test_status_list(mock_mongo):
    from server import app
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/status")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


@pytest.mark.asyncio
async def test_regex_escape():
    from server import _regex_escape
    assert _regex_escape("test.key") == r"test\.key"
    assert _regex_escape("a+b*c") == r"a\+b\*c"
    assert _regex_escape("normal") == "normal"
