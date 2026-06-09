from fastapi import APIRouter

from app.schemas.corpus import CorpusManifest
from app.services.corpus_registry import ingestion_pipeline, list_corpus_layers
from app.services.ingestion_service import load_store, store_summary

router = APIRouter()


@router.get("/layers")
def layers() -> dict:
    return {"root": "knowledge_base", "layers": list_corpus_layers()}


@router.get("/pipeline")
def pipeline() -> dict:
    return {"pipeline": ingestion_pipeline()}


@router.post("/manifest/validate")
def validate_manifest(manifest: CorpusManifest) -> dict:
    return {"valid": True, "manifest": manifest.model_dump()}


@router.get("/stats")
def stats() -> dict:
    summary = store_summary()
    return {
        "layers": {
            "papers": 0,
            "gazetteers": 0,
            "ancient_books": 0,
            "wechat_articles": 0,
            "web_resources": 0,
            "images": 0,
            "maps": 0,
            "multimedia": 0,
        },
        "embedding_models": ["BGE-M3", "bge-large-zh"],
        "retrieval": ["semantic", "keyword", "hybrid"],
        "store": summary,
    }


@router.get("/items")
def items() -> dict:
    store = load_store()
    corpus_items = store["corpus_items"]
    chunk_counts: dict[str, int] = {}
    mention_counts: dict[str, int] = {}
    for chunk in store["document_chunks"]:
        chunk_counts[chunk["corpus_item_id"]] = chunk_counts.get(chunk["corpus_item_id"], 0) + 1
    for mention in store["entity_mentions"]:
        mention_counts[mention["corpus_item_id"]] = mention_counts.get(mention["corpus_item_id"], 0) + 1
    return {
        "items": [
            {
                **item,
                "chunk_count": chunk_counts.get(item["id"], 0),
                "entity_mention_count": mention_counts.get(item["id"], 0),
            }
            for item in corpus_items
        ]
    }


@router.get("/items/{item_id}")
def item_detail(item_id: str) -> dict:
    store = load_store()
    item = next((candidate for candidate in store["corpus_items"] if candidate["id"] == item_id), None)
    if not item:
        return {"error": "not_found"}
    chunks = [chunk for chunk in store["document_chunks"] if chunk["corpus_item_id"] == item_id]
    mentions = [mention for mention in store["entity_mentions"] if mention["corpus_item_id"] == item_id]
    relations = [relation for relation in store["knowledge_relations"] if relation.get("evidence_corpus_item_id") == item_id]
    return {"item": item, "chunks": chunks, "mentions": mentions, "relations": relations}
