import shutil
from pathlib import Path

from fastapi import APIRouter, HTTPException, UploadFile
from pydantic import BaseModel

from app.core.config import settings
from app.schemas.corpus import CorpusLayer, SourceType
from app.services.corpus_registry import KNOWLEDGE_BASE_ROOT
from app.services.ingestion_service import import_directory, import_file, load_store, scan_imports_dir

router = APIRouter()


class IngestRequest(BaseModel):
    layer: CorpusLayer
    source_type: SourceType
    source_url: str | None = None
    local_path: str | None = None
    title: str


@router.post("/jobs")
def create_ingest_job(payload: IngestRequest) -> dict:
    return {
        "status": "queued",
        "job": {
            "title": payload.title,
            "layer": payload.layer,
            "source_type": payload.source_type,
            "source_url": payload.source_url,
            "local_path": payload.local_path,
            "next_steps": ["parse", "clean", "deduplicate", "chunk", "extract", "embed", "index"],
        },
    }


@router.get("/deduplication/policy")
def deduplication_policy() -> dict:
    return {
        "checksum": "sha256(raw_file)",
        "near_duplicate": "simhash(clean_text) + title_author_year",
        "paper_duplicate": "doi first, then title + author + year",
        "web_duplicate": "canonical_url + content_hash",
    }


@router.post("/import-file")
async def import_uploaded_file(file: UploadFile) -> dict:
    upload_dir = KNOWLEDGE_BASE_ROOT / "imports" / ".tmp_uploads"
    upload_dir.mkdir(parents=True, exist_ok=True)
    safe_name = Path(file.filename or "upload.txt").name
    target = upload_dir / safe_name
    max_bytes = settings.upload_max_mb * 1024 * 1024
    written = 0
    try:
        with target.open("wb") as output:
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk:
                    break
                written += len(chunk)
                if written > max_bytes:
                    raise HTTPException(status_code=413, detail=f"File exceeds {settings.upload_max_mb} MB limit")
                output.write(chunk)
        return import_file(target)
    finally:
        try:
            target.unlink(missing_ok=True)
        except OSError:
            pass


@router.post("/import-directory")
def import_imports_directory() -> dict:
    return import_directory()


@router.get("/imports")
def list_imports() -> dict:
    return {"items": scan_imports_dir()}


@router.get("/jobs")
def jobs() -> dict:
    store = load_store()
    return {"items": store["ingestion_jobs"] + store["update_jobs"]}
