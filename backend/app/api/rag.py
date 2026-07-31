import asyncio
import logging

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.rag_service import answer_question, retrieve_context
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)


class AskRequest(BaseModel):
    question: str
    top_k: int = 5
    search_type: str = "hybrid"


class RetrieveRequest(BaseModel):
    question: str
    mode: str = "hybrid"
    limit: int = 5


@router.post("/retrieve")
async def retrieve(payload: RetrieveRequest) -> dict:
    question = payload.question.strip()
    if not question:
        return _retrieve_error_response("请输入研究问题。", "invalid_request", payload.mode)
    if len(question) > 1000:
        return _retrieve_error_response("问题长度不能超过 1000 个字符。", "invalid_request", payload.mode)
    try:
        return await asyncio.wait_for(
            asyncio.to_thread(retrieve_context, question, payload.limit, payload.mode),
            timeout=settings.rag_timeout_seconds,
        )
    except TimeoutError:
        logger.warning("RAG retrieval timed out after %s seconds", settings.rag_timeout_seconds)
        return _retrieve_error_response("检索超时，请缩短问题后重试。", "timeout", payload.mode)
    except Exception:
        logger.exception("RAG retrieval failed")
        return _retrieve_error_response("知识库检索暂时不可用，请稍后重试。", "error", payload.mode)


@router.post("/ask")
async def ask(payload: AskRequest) -> dict:
    question = payload.question.strip()
    if not question:
        return _error_response("请输入研究问题。", "invalid_request")
    if len(question) > 1000:
        return _error_response("问题长度不能超过 1000 个字符。", "invalid_request")

    try:
        return await asyncio.wait_for(
            asyncio.to_thread(answer_question, question, payload.top_k, payload.search_type),
            timeout=settings.rag_timeout_seconds,
        )
    except TimeoutError:
        logger.warning("RAG request timed out after %s seconds", settings.rag_timeout_seconds)
        return _error_response("检索超时，请缩短问题后重试。", "timeout")
    except Exception:
        logger.exception("RAG request failed")
        return _error_response("研究助手暂时不可用，请稍后重试。", "error")


def _error_response(answer: str, status: str) -> dict:
    return {
        "answer": answer,
        "citations": [],
        "retrieved_chunks": [],
        "chunks": [],
        "confidence": "low",
        "llm_provider": "fallback",
        "mode": "low-resource",
        "status": status,
    }


def _retrieve_error_response(message: str, status: str, requested_mode: str) -> dict:
    return {
        "status": status,
        "question": "",
        "requested_mode": requested_mode,
        "mode": "hybrid-lite" if requested_mode == "hybrid" else requested_mode,
        "citations": [],
        "chunks": [],
        "retrieved_chunks": [],
        "context": "",
        "message": message,
    }
