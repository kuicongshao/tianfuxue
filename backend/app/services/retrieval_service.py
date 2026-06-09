from __future__ import annotations

import math
import re
from collections import Counter
from typing import Any

from app.services.embedding_service import EmbeddingService, cosine_similarity
from app.services.ingestion_service import load_store


def search(query: str, top_k: int = 5, search_type: str = "hybrid") -> list[dict[str, Any]]:
    store = load_store()
    items_by_id = {item["id"]: item for item in store["corpus_items"]}
    chunks = store["document_chunks"]
    if search_type == "keyword":
        scored = _keyword_search(query, chunks)
    elif search_type == "vector":
        scored = _vector_search(query, chunks)
    else:
        scored = _hybrid_search(query, chunks)

    results = []
    for chunk, score in scored[:top_k]:
        item = items_by_id.get(chunk["corpus_item_id"], {})
        results.append(
            {
                "chunk_id": chunk["id"],
                "corpus_item_id": chunk["corpus_item_id"],
                "title": item.get("title", "未知文献"),
                "text": chunk["text"],
                "score": round(float(score), 6),
                "source_path": item.get("source_path"),
                "metadata": {**chunk.get("metadata", {}), "item": item.get("metadata", {})},
            }
        )
    return results


def _keyword_search(query: str, chunks: list[dict[str, Any]]) -> list[tuple[dict[str, Any], float]]:
    query_terms = _terms(query)
    if not query_terms:
        return []
    docs_terms = [_terms(chunk["text"]) for chunk in chunks]
    doc_count = max(1, len(chunks))
    document_frequency = Counter()
    for terms in docs_terms:
        for term in set(terms):
            document_frequency[term] += 1

    scored = []
    for chunk, terms in zip(chunks, docs_terms):
        term_counts = Counter(terms)
        score = 0.0
        for term in query_terms:
            if not term_counts[term]:
                continue
            idf = math.log((doc_count + 1) / (document_frequency[term] + 0.5)) + 1
            score += term_counts[term] * idf
        if score:
            scored.append((chunk, score))
    return sorted(scored, key=lambda item: item[1], reverse=True)


def _vector_search(query: str, chunks: list[dict[str, Any]]) -> list[tuple[dict[str, Any], float]]:
    service = EmbeddingService()
    query_embedding = service.embed_query(query)
    scored = []
    for chunk in chunks:
        embedding = chunk.get("embedding")
        if not embedding:
            embedding = service.embed_query(chunk["text"])
        score = cosine_similarity(query_embedding, embedding)
        if score > 0:
            scored.append((chunk, score))
    return sorted(scored, key=lambda item: item[1], reverse=True)


def _hybrid_search(query: str, chunks: list[dict[str, Any]]) -> list[tuple[dict[str, Any], float]]:
    keyword = _normalize_scores(_keyword_search(query, chunks))
    vector = _normalize_scores(_vector_search(query, chunks))
    merged: dict[str, tuple[dict[str, Any], float]] = {}
    for chunk, score in keyword:
        merged[chunk["id"]] = (chunk, merged.get(chunk["id"], (chunk, 0.0))[1] + score * 0.55)
    for chunk, score in vector:
        merged[chunk["id"]] = (chunk, merged.get(chunk["id"], (chunk, 0.0))[1] + score * 0.45)
    return sorted(merged.values(), key=lambda item: item[1], reverse=True)


def _normalize_scores(scored: list[tuple[dict[str, Any], float]]) -> list[tuple[dict[str, Any], float]]:
    if not scored:
        return []
    max_score = max(score for _, score in scored) or 1.0
    return [(chunk, score / max_score) for chunk, score in scored]


def _terms(text: str) -> list[str]:
    terms = re.findall(r"[a-z0-9_]+|[\u4e00-\u9fff]{1,4}", text.lower())
    for index in range(max(0, len(text) - 1)):
        pair = text[index : index + 2].strip()
        if pair and re.search(r"[\u4e00-\u9fff]", pair):
            terms.append(pair)
    return terms
