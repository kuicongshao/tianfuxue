from fastapi import APIRouter
from pydantic import BaseModel

from app.services.rag_service import answer_question

router = APIRouter()


class AskRequest(BaseModel):
    question: str
    top_k: int = 5
    search_type: str = "hybrid"


@router.post("/ask")
def ask(payload: AskRequest) -> dict:
    return answer_question(payload.question, top_k=payload.top_k, search_type=payload.search_type)
