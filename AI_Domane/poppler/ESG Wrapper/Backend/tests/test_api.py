"""
API tests for the ESGCaffe Agentic RAG backend.

Run:  pytest tests/ -v
"""

import io
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


# ── Health ──────────────────────────────────────────────

def test_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "healthy"
    assert body["version"] == "2.0.0"


# ── Document Ingestion ──────────────────────────────────

def test_ingest_bad_directory():
    """Ingesting from a nonexistent directory should fail."""
    resp = client.post(
        "/api/v1/documents/ingest?data_dir=nonexistent_dir",
        data={"user_id": "test-user"},
    )
    assert resp.status_code in (404, 500)


def test_ingest_rejects_non_txt():
    """Only .txt files should be accepted."""
    resp = client.post(
        "/api/v1/documents/ingest",
        data={"user_id": "test-user"},
        files={"file": ("report.pdf", b"fake content", "application/pdf")},
    )
    assert resp.status_code == 400


def test_ingest_rejects_empty_file():
    """Empty file uploads should be rejected."""
    resp = client.post(
        "/api/v1/documents/ingest",
        data={"user_id": "test-user"},
        files={"file": ("empty.txt", b"", "text/plain")},
    )
    assert resp.status_code == 400


# ── Chat Stream ────────────────────────────────────────

def test_chat_stream_returns_sse():
    """The streaming endpoint should return text/event-stream."""
    resp = client.post(
        "/api/v1/chat/stream",
        json={"question": "What is ESG assurance?", "user_id": "test-user"},
    )
    assert resp.status_code == 200
    assert "text/event-stream" in resp.headers["content-type"]


def test_chat_stream_includes_user_header():
    """Response should include the X-User-Id header."""
    resp = client.post(
        "/api/v1/chat/stream",
        json={"question": "hello", "user_id": "user-42"},
    )
    assert resp.headers.get("x-user-id") == "user-42"


def test_chat_stream_auto_generates_user_id():
    """When no user_id is provided, one should be auto-generated."""
    resp = client.post(
        "/api/v1/chat/stream",
        json={"question": "hello"},
    )
    assert resp.status_code == 200
    assert resp.headers.get("x-user-id")
