import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    database_url: str = os.getenv("DATABASE_URL", "postgresql+psycopg://tianfu:tianfu@postgres-pgvector:5432/tianfu")
    database_mode: str = os.getenv("DATABASE_MODE", "json")
    openai_api_key: str | None = os.getenv("OPENAI_API_KEY") or None
    deepseek_api_key: str | None = os.getenv("DEEPSEEK_API_KEY") or None
    embedding_provider: str = os.getenv("EMBEDDING_PROVIDER", "local")
    embedding_model: str = os.getenv("EMBEDDING_MODEL", "BAAI/bge-m3")
    llm_provider: str = os.getenv("LLM_PROVIDER", "fallback")
    news_cache_weeks: int = int(os.getenv("NEWS_CACHE_WEEKS", "12"))
    enable_paid_api: bool = os.getenv("ENABLE_PAID_API", "false").lower() == "true"
    low_resource_mode: bool = os.getenv("LOW_RESOURCE_MODE", "true").lower() == "true"
    rag_timeout_seconds: float = float(os.getenv("RAG_TIMEOUT_SECONDS", "8"))
    rag_max_chunks: int = int(os.getenv("RAG_MAX_CHUNKS", "5"))
    enable_local_embedding: bool = os.getenv("ENABLE_LOCAL_EMBEDDING", "false").lower() == "true"
    upload_max_mb: int = int(os.getenv("UPLOAD_MAX_MB", "25"))

    @property
    def allow_external_embedding_api(self) -> bool:
        return self.enable_paid_api and self.embedding_provider == "api" and bool(self.openai_api_key or self.deepseek_api_key)

    @property
    def allow_external_llm_api(self) -> bool:
        if not self.enable_paid_api:
            return False
        if self.llm_provider == "openai":
            return bool(self.openai_api_key)
        if self.llm_provider == "deepseek":
            return bool(self.deepseek_api_key)
        return False


settings = Settings()
