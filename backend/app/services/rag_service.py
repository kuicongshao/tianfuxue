from __future__ import annotations

from typing import Any

from app.core.config import settings
from app.services.retrieval_service import search


def retrieve_context(question: str, top_k: int = 5, search_type: str = "hybrid") -> dict[str, Any]:
    """Return bounded, low-resource retrieval evidence without generating an answer."""
    mode = "hybrid-lite" if settings.low_resource_mode and search_type == "hybrid" else search_type
    retrieved = search(question, top_k=top_k, search_type=search_type)
    citations = _citations(retrieved)
    context_parts = []
    for citation, chunk in zip(citations, retrieved):
        text = " ".join(chunk["text"].split())[:1200]
        context_parts.append(f"[{citation['index']}] {chunk['title']}\n{text}")
    return {
        "status": "ok" if retrieved else "no_context",
        "question": question,
        "requested_mode": search_type,
        "mode": mode,
        "citations": citations,
        "chunks": retrieved,
        "retrieved_chunks": retrieved,
        "context": "\n\n".join(context_parts),
    }


def answer_question(question: str, top_k: int = 5, search_type: str = "hybrid") -> dict[str, Any]:
    mode = "lightweight-hybrid" if settings.low_resource_mode and search_type == "hybrid" else search_type
    retrieved = search(question, top_k=top_k, search_type=search_type)
    if not retrieved:
        return {
            "answer": "当前知识库尚未导入足够的相关资料，请先在文献库中导入或精选相关文献。",
            "citations": [],
            "retrieved_chunks": [],
            "chunks": [],
            "confidence": "low",
            "llm_provider": "fallback",
            "mode": mode,
            "status": "no_context",
        }

    if settings.allow_external_llm_api:
        answer = _answer_with_external_llm(question, retrieved)
        provider = settings.llm_provider
    else:
        answer = _fallback_answer(question, retrieved)
        provider = "fallback"

    return {
        "answer": answer,
        "citations": _citations(retrieved),
        "retrieved_chunks": retrieved,
        "chunks": retrieved,
        "confidence": "medium" if retrieved[0]["score"] >= 0.35 else "low",
        "llm_provider": provider,
        "mode": mode,
        "status": "ok",
    }


def _fallback_answer(question: str, chunks: list[dict[str, Any]]) -> str:
    lines = ["未配置外部 LLM API，系统使用本地 fallback 模式，仅基于检索片段生成摘要。", ""]
    lines.append(f"问题：{question}")
    lines.append("")
    lines.append("知识库依据摘要：")
    for index, chunk in enumerate(chunks[:3], start=1):
        text = chunk["text"].replace("\n", " ")
        lines.append(f"[{index}] {text[:220]}{'...' if len(text) > 220 else ''}")
    lines.append("")
    lines.append("以上回答仅来自当前知识库检索结果；如需外部模型综合写作，请显式设置 ENABLE_PAID_API=true 并配置 OPENAI_API_KEY 或 DEEPSEEK_API_KEY。")
    return "\n".join(lines)


def _answer_with_external_llm(question: str, chunks: list[dict[str, Any]]) -> str:
    # Paid-provider adapters are intentionally gated. This MVP avoids network calls unless
    # a deployment explicitly configures a provider and implements the adapter.
    return _fallback_answer(question, chunks)


def _citations(chunks: list[dict[str, Any]]) -> list[dict[str, Any]]:
    citations = []
    for index, chunk in enumerate(chunks, start=1):
        citations.append(
            {
                "index": index,
                "title": chunk["title"],
                "chunk_id": chunk["chunk_id"],
                "corpus_item_id": chunk["corpus_item_id"],
                "source_path": chunk["source_path"],
                "score": chunk["score"],
                "page": chunk.get("metadata", {}).get("page_number"),
                "url": chunk.get("metadata", {}).get("item", {}).get("source_url"),
            }
        )
    return citations
