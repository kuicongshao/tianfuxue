from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import agents, analytics, atlas, corpus, graph, ingestion, knowledge, literature, map, news, rag, research, search, update_agent

app = FastAPI(title="Tianfu Studies AI Platform API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(research.router, prefix="/api/research", tags=["research"])
app.include_router(atlas.router, prefix="/api/atlas", tags=["atlas"])
app.include_router(knowledge.router, prefix="/api/knowledge", tags=["knowledge"])
app.include_router(literature.router, prefix="/api/literature", tags=["literature"])
app.include_router(rag.router, prefix="/api/rag", tags=["rag"])
app.include_router(agents.router, prefix="/api/agents", tags=["agents"])
app.include_router(corpus.router, prefix="/api/corpus", tags=["corpus"])
app.include_router(ingestion.router, prefix="/api/ingestion", tags=["ingestion"])
app.include_router(graph.router, prefix="/api/graph", tags=["graph"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(update_agent.router, prefix="/api/update-agent", tags=["update-agent"])
app.include_router(search.router, prefix="/api", tags=["search"])
app.include_router(news.router, prefix="/api/news", tags=["news"])
app.include_router(map.router, prefix="/api/map", tags=["map"])


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
