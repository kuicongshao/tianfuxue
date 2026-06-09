from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.services.embedding_service import EmbeddingService
from app.services.ingestion_service import load_store, save_store


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def run_embedding_jobs(limit: int = 50) -> dict[str, Any]:
    store = load_store()
    chunks_by_id = {chunk["id"]: chunk for chunk in store["document_chunks"]}
    service = EmbeddingService()
    completed = 0
    failed = 0
    processed_jobs: list[dict[str, Any]] = []

    pending_jobs = [
        job
        for job in store["update_jobs"]
        if job.get("job_type") == "embedding" and job.get("status") == "pending" and job.get("target_type") == "document_chunk"
    ][:limit]

    for job in pending_jobs:
        try:
            chunk = chunks_by_id.get(job.get("target_id"))
            if not chunk:
                raise ValueError(f"Chunk not found: {job.get('target_id')}")
            embedding = service.embed_query(chunk["text"])
            chunk["embedding"] = embedding
            chunk["embedding_model"] = service.model_name
            chunk["embedding_created_at"] = _now()
            job["status"] = "completed"
            job["result"] = {**job.get("result", {}), "embedding_model": service.model_name, "dimension": len(embedding)}
            job["updated_at"] = _now()
            completed += 1
        except Exception as exc:
            job["status"] = "failed"
            job["error_message"] = str(exc)
            job["updated_at"] = _now()
            failed += 1
        processed_jobs.append(job)

    save_store(store)
    return {"processed": len(processed_jobs), "completed": completed, "failed": failed, "jobs": processed_jobs}
