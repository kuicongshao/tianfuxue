from fastapi import APIRouter
from pydantic import BaseModel

from app.services.ingestion_service import load_store
from app.services.job_runner import run_embedding_jobs

router = APIRouter()


class UpdateSource(BaseModel):
    source_name: str
    source_url: str | None = None
    job_type: str
    schedule_cron: str = "0 3 * * 1"


@router.get("/policy")
def policy() -> dict:
    return {
        "checks": ["新增论文", "新增地方志", "新增研究成果", "新增公开文化资源", "新增用户上传内容"],
        "actions": ["自动入库", "自动解析", "自动去重", "自动向量化", "自动更新知识图谱"],
        "default_schedule": "每周一 03:00",
    }


@router.post("/sources")
def register_source(payload: UpdateSource) -> dict:
    return {"status": "registered", "source": payload.model_dump()}


@router.get("/jobs")
def jobs() -> dict:
    store = load_store()
    return {"items": store["update_jobs"]}


@router.post("/run-embedding-jobs")
def run_embeddings(limit: int = 50) -> dict:
    return run_embedding_jobs(limit=limit)
