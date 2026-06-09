from __future__ import annotations

import hashlib
import math
import os
import re
from functools import lru_cache
from typing import Iterable

from app.core.config import settings

EMBEDDING_DIMENSION = 1024


class EmbeddingService:
    def __init__(self, provider: str | None = None, model_name: str | None = None):
        self.provider = provider or settings.embedding_provider
        self.model_name = model_name or settings.embedding_model

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        if self.provider == "api":
            return self._embed_with_api(texts)
        return self._embed_with_local(texts)

    def embed_query(self, query: str) -> list[float]:
        return self.embed_texts([query])[0]

    def _embed_with_local(self, texts: list[str]) -> list[list[float]]:
        model = _load_sentence_transformer(self.model_name)
        if model is not None:
            vectors = model.encode(texts, normalize_embeddings=True)
            return [_fit_dimension([float(value) for value in vector]) for vector in vectors]
        return [deterministic_embedding(text) for text in texts]

    def _embed_with_api(self, texts: list[str]) -> list[list[float]]:
        if not settings.allow_external_embedding_api:
            raise RuntimeError("External embedding API is disabled. Keep EMBEDDING_PROVIDER=local, or set ENABLE_PAID_API=true and configure OPENAI_API_KEY/DEEPSEEK_API_KEY explicitly.")
        raise NotImplementedError("API embedding provider is intentionally gated for a later paid-provider adapter.")


@lru_cache(maxsize=2)
def _load_sentence_transformer(model_name: str):
    try:
        from sentence_transformers import SentenceTransformer

        return SentenceTransformer(model_name)
    except Exception:
        return None


def deterministic_embedding(text: str, dimension: int = EMBEDDING_DIMENSION) -> list[float]:
    vector = [0.0] * dimension
    tokens = list(_tokens(text))
    if not tokens:
        return vector
    for token in tokens:
        digest = hashlib.sha256(token.encode("utf-8")).digest()
        index = int.from_bytes(digest[:4], "big") % dimension
        sign = 1.0 if digest[4] % 2 == 0 else -1.0
        vector[index] += sign
    norm = math.sqrt(sum(value * value for value in vector)) or 1.0
    return [value / norm for value in vector]


def cosine_similarity(left: list[float], right: list[float]) -> float:
    if not left or not right:
        return 0.0
    size = min(len(left), len(right))
    return sum(left[index] * right[index] for index in range(size))


def _tokens(text: str) -> Iterable[str]:
    lowered = text.lower()
    for token in re.findall(r"[a-z0-9_]+|[\u4e00-\u9fff]{1,4}", lowered):
        yield token
    for index in range(max(0, len(text) - 1)):
        pair = text[index : index + 2].strip()
        if pair and re.search(r"[\u4e00-\u9fff]", pair):
            yield pair


def _fit_dimension(vector: list[float], dimension: int = EMBEDDING_DIMENSION) -> list[float]:
    if len(vector) == dimension:
        return vector
    if len(vector) > dimension:
        fitted = vector[:dimension]
    else:
        fitted = vector + [0.0] * (dimension - len(vector))
    norm = math.sqrt(sum(value * value for value in fitted)) or 1.0
    return [value / norm for value in fitted]
