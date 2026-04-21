"""
Document Ingestion Controller.

Endpoint: POST /api/v1/documents/ingest
  ● Accepts a text file upload + user_id
  ● OR ingests from a directory path (admin/dev use)

Thin layer — all logic is in IngestService.
"""

import traceback

from fastapi import APIRouter, UploadFile, File, Form, Query, HTTPException
from pydantic import BaseModel

from app.modules.rag.services.ingest_service import IngestService
from app.utils.logger import logger

router = APIRouter(prefix="/documents", tags=["Documents"])

_ingest_service = IngestService()


# ── Response Schemas ────────────────────────────────────

class IngestResponse(BaseModel):
    status: str
    user_id: str
    filename: str | None = None
    chunks: int
    message: str


# ── Endpoints ───────────────────────────────────────────

@router.post("/ingest", response_model=IngestResponse)
async def ingest_document(
    file: UploadFile | None = File(None, description="Text file to ingest"),
    user_id: str = Form("default", description="User ID for collection isolation"),
    data_dir: str | None = Query(None, description="Directory path (alternative to file upload)"),
):
    """POST /api/v1/documents/ingest

    Two modes:
      1. File upload:  multipart form with `file` + `user_id`
      2. Directory:    query param `data_dir` + `user_id`
    """
    try:
        # Mode 1: File upload
        if file is not None:
            if not file.filename.endswith(".txt"):
                raise HTTPException(
                    status_code=400,
                    detail="Only .txt files are supported",
                )

            content = await file.read()
            if not content:
                raise HTTPException(status_code=400, detail="Uploaded file is empty")

            logger.info(f"API /ingest — file={file.filename}, user={user_id}")
            chunks = await _ingest_service.ingest_upload(content, file.filename, user_id)

            return IngestResponse(
                status="ok",
                user_id=user_id,
                filename=file.filename,
                chunks=chunks,
                message=f"Successfully ingested {chunks} chunks from {file.filename}",
            )

        # Mode 2: Directory ingestion
        logger.info(f"API /ingest — dir={data_dir}, user={user_id}")
        chunks = _ingest_service.ingest_directory(data_dir, user_id)

        return IngestResponse(
            status="ok",
            user_id=user_id,
            filename=None,
            chunks=chunks,
            message=f"Successfully ingested {chunks} chunks from directory",
        )

    except HTTPException:
        raise
    except FileNotFoundError as e:
        logger.error(f"Ingest failed — not found: {e}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Ingest failed: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Ingestion error: {str(e)}")
