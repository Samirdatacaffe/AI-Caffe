"""
FastAPI entry point — ESGCaffe Agentic RAG Backend.

Features:
  ● CORS middleware
  ● v1 API routers (documents + chat)
  ● Lifespan-based graceful startup / shutdown
  ● Health check

Run:  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
"""

import signal
import asyncio
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.modules.rag.controllers.document_controller import router as doc_router
from app.modules.rag.controllers.chat_controller import router as chat_router
from app.utils.logger import logger

FRONTEND_DIR = Path(__file__).resolve().parent.parent.parent / "Frontend"


# ── Graceful shutdown state ─────────────────────────────

_shutdown_event = asyncio.Event()


def _signal_handler(sig, frame):
    """Handle SIGINT / SIGTERM for graceful shutdown."""
    logger.info(f"Received signal {sig} — initiating graceful shutdown")
    _shutdown_event.set()


# ── Lifespan (startup + shutdown) ───────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle."""
    # ── Startup ─────────────────────────────────────────
    logger.info("=" * 60)
    logger.info("ESGCaffe Agentic RAG API — starting up")
    logger.info("=" * 60)

    # Register signal handlers for graceful shutdown
    signal.signal(signal.SIGINT, _signal_handler)
    signal.signal(signal.SIGTERM, _signal_handler)

    yield   # ← app is running

    # ── Shutdown ────────────────────────────────────────
    logger.info("Shutting down — stopping new requests")
    logger.info("Flushing logs and closing connections")
    logger.info("ESGCaffe RAG API — shutdown complete")


# ── App factory ─────────────────────────────────────────

app = FastAPI(
    title="ESGCaffe Agentic RAG API",
    version="2.0.0",
    description=(
        "Production-ready Agentic RAG system for ESG assurance.\n\n"
        "**Features:** Agentic AI · Per-user isolation · Token streaming · "
        "Redis memory with fallback · ChromaDB vector store · File upload"
    ),
    lifespan=lifespan,
)

# ── CORS ────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers (v1 API) ───────────────────────────────────

app.include_router(doc_router, prefix="/api/v1")
app.include_router(chat_router, prefix="/api/v1")


# ── Health check ────────────────────────────────────────

@app.get("/health", tags=["System"])
async def health():
    """Liveness probe for load balancers and monitoring."""
    return {
        "status": "healthy",
        "service": "esgcaffe-rag",
        "version": "2.0.0",
    }


# ── Serve Frontend ─────────────────────────────────────

@app.get("/", include_in_schema=False)
async def serve_frontend():
    """Serve the chatbot frontend."""
    return FileResponse(FRONTEND_DIR / "index.html")


if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")
