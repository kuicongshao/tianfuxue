from fastapi import APIRouter
from pydantic import BaseModel

from app.services.retrieval_service import search

router = APIRouter()


class SearchRequest(BaseModel):
    query: str
    top_k: int = 5
    search_type: str = "hybrid"


@router.post("/search")
def search_api(payload: SearchRequest) -> dict:
    return {"items": search(payload.query, top_k=payload.top_k, search_type=payload.search_type)}
