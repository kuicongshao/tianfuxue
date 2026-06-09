from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timezone
from difflib import SequenceMatcher
from pathlib import Path
from typing import Any
from uuid import uuid4

from app.schemas.corpus import ParsedDocument, RelationType
from app.services.corpus_registry import KNOWLEDGE_BASE_ROOT
from app.services.entity_extractor import extract_entities_from_text
from app.services.parsers import is_supported_file, parse_supported_file

STORE_PATH = KNOWLEDGE_BASE_ROOT / "processed" / "corpus_store.json"
IMPORTS_DIR = KNOWLEDGE_BASE_ROOT / "imports"
CHUNK_SIZE = 800
CHUNK_OVERLAP = 120


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _empty_store() -> dict[str, list[dict[str, Any]]]:
    return {
        "corpus_items": [],
        "document_chunks": [],
        "knowledge_entities": [],
        "entity_mentions": [],
        "knowledge_relations": [],
        "update_jobs": [],
        "ingestion_jobs": [],
    }


def load_store() -> dict[str, list[dict[str, Any]]]:
    import json

    STORE_PATH.parent.mkdir(parents=True, exist_ok=True)
    if not STORE_PATH.exists():
        return _empty_store()
    data = json.loads(STORE_PATH.read_text(encoding="utf-8"))
    store = _empty_store()
    store.update(data)
    return store


def save_store(store: dict[str, list[dict[str, Any]]]) -> None:
    import json

    STORE_PATH.parent.mkdir(parents=True, exist_ok=True)
    STORE_PATH.write_text(json.dumps(store, ensure_ascii=False, indent=2), encoding="utf-8")


def scan_imports_dir() -> list[dict[str, str | int]]:
    IMPORTS_DIR.mkdir(parents=True, exist_ok=True)
    files = []
    for path in sorted(IMPORTS_DIR.rglob("*")):
        if is_supported_file(path):
            files.append({"path": str(path), "file_name": path.name, "suffix": path.suffix.lower(), "size": path.stat().st_size})
    return files


def parse_file(source_path: str | Path) -> ParsedDocument:
    path = Path(source_path)
    if not path.is_absolute():
        path = (Path.cwd() / path).resolve()
    return parse_supported_file(path)


def normalize_document(document: ParsedDocument) -> ParsedDocument:
    document.title = document.title.strip() or document.file_name
    document.keywords = sorted({item.strip() for item in document.keywords if item.strip()})
    document.authors = [item.strip() for item in document.authors if item.strip()]
    document.clean_text = document.clean_text.strip()
    return document


def _similarity(left: str, right: str) -> float:
    if not left or not right:
        return 0.0
    return SequenceMatcher(None, left[:1000], right[:1000]).ratio()


def deduplicate_document(document: ParsedDocument, store: dict[str, list[dict[str, Any]]]) -> dict[str, Any] | None:
    for item in store["corpus_items"]:
        if item.get("checksum") == document.checksum:
            return {"duplicate_of": item["id"], "reason": "checksum"}
        title_score = _similarity(document.title, item.get("title", ""))
        text_score = _similarity(document.clean_text, item.get("metadata", {}).get("text_preview", ""))
        if title_score >= 0.92 and text_score >= 0.88:
            return {"duplicate_of": item["id"], "reason": "title_and_text_similarity", "title_score": title_score, "text_score": text_score}
    return None


def _infer_layer(document: ParsedDocument) -> str:
    text = f"{document.title}\n{' '.join(document.keywords)}\n{document.clean_text[:500]}"
    if document.file_type == "json" and any(word in text for word in ["文化遗产", "非遗", "古建筑"]):
        return "web_resources"
    if any(word in text for word in ["地方志", "省志", "府志", "通志", "华阳国志"]):
        return "gazetteers"
    if any(word in text for word in ["蜀中广记", "全蜀艺文志", "蜀碧", "蜀鉴"]):
        return "ancient_books"
    if document.file_type in {"html"}:
        return "web_resources"
    return "papers"


def create_corpus_item(document: ParsedDocument, store: dict[str, list[dict[str, Any]]], duplicate: dict[str, Any] | None = None) -> dict[str, Any]:
    item = {
        "id": str(uuid4()),
        "title": document.title,
        "layer": _infer_layer(document),
        "source_type": document.file_type,
        "source_path": document.source_path,
        "checksum": document.checksum,
        "ingest_status": "duplicate" if duplicate else "indexed",
        "duplicate_of": duplicate["duplicate_of"] if duplicate else None,
        "authors": document.authors,
        "year": document.year,
        "abstract": document.abstract,
        "keywords": document.keywords,
        "metadata": {
            **document.metadata,
            "file_name": document.file_name,
            "text_preview": document.clean_text[:1000],
            "duplicate": duplicate,
        },
        "created_at": _now(),
    }
    store["corpus_items"].append(item)
    return item


def create_document_chunks(corpus_item: dict[str, Any], document: ParsedDocument, store: dict[str, list[dict[str, Any]]]) -> list[dict[str, Any]]:
    text = document.clean_text
    chunks: list[dict[str, Any]] = []
    start = 0
    index = 0
    while start < len(text):
        end = min(len(text), start + CHUNK_SIZE)
        chunk_text = text[start:end].strip()
        if chunk_text:
            chunk = {
                "id": str(uuid4()),
                "corpus_item_id": corpus_item["id"],
                "chunk_index": index,
                "text": chunk_text,
                "token_count": len(chunk_text),
                "metadata": {"start": start, "end": end, "source_path": document.source_path},
            }
            chunks.append(chunk)
            store["document_chunks"].append(chunk)
            index += 1
        if end >= len(text):
            break
        start = max(0, end - CHUNK_OVERLAP)
    return chunks


def _entity_key(name: str, entity_type: str) -> tuple[str, str]:
    return (name.strip(), entity_type)


def _get_or_create_entity(entity: dict[str, Any], store: dict[str, list[dict[str, Any]]]) -> dict[str, Any]:
    key = _entity_key(entity["name"], entity["entity_type"])
    for existing in store["knowledge_entities"]:
        if _entity_key(existing["name"], existing["entity_type"]) == key:
            return existing
    created = {
        "id": str(uuid4()),
        "name": entity["name"],
        "entity_type": entity["entity_type"],
        "aliases": [],
        "description": None,
        "confidence": entity.get("confidence", 0.7),
        "metadata": {},
        "created_at": _now(),
    }
    store["knowledge_entities"].append(created)
    return created


def create_entity_mentions(corpus_item: dict[str, Any], chunks: list[dict[str, Any]], store: dict[str, list[dict[str, Any]]]) -> list[dict[str, Any]]:
    mentions: list[dict[str, Any]] = []
    for chunk in chunks:
        extracted = extract_entities_from_text(chunk["text"])
        for entity_data in extracted:
            entity = _get_or_create_entity(entity_data, store)
            mention = {
                "id": str(uuid4()),
                "entity_id": entity["id"],
                "corpus_item_id": corpus_item["id"],
                "chunk_id": chunk["id"],
                "surface_text": entity_data["surface_text"],
                "entity_type": entity_data["entity_type"],
                "confidence": entity_data.get("confidence", 0.7),
                "context": entity_data.get("context"),
            }
            mentions.append(mention)
            store["entity_mentions"].append(mention)
    return mentions


def create_embedding_job(chunk: dict[str, Any], store: dict[str, list[dict[str, Any]]]) -> dict[str, Any]:
    job = {
        "id": str(uuid4()),
        "job_type": "embedding",
        "status": "pending",
        "target_type": "document_chunk",
        "target_id": chunk["id"],
        "source_path": chunk["metadata"].get("source_path"),
        "result": {"embedding_model": "BGE-M3"},
        "created_at": _now(),
    }
    store["update_jobs"].append(job)
    return job


def _relation_exists(store: dict[str, list[dict[str, Any]]], source_id: str, target_id: str, relation_type: str, chunk_id: str) -> bool:
    return any(
        relation["source_entity_id"] == source_id
        and relation["target_entity_id"] == target_id
        and relation["relation_type"] == relation_type
        and relation.get("evidence_chunk_id") == chunk_id
        for relation in store["knowledge_relations"]
    )


def generate_basic_relations(corpus_item: dict[str, Any], mentions: list[dict[str, Any]], store: dict[str, list[dict[str, Any]]]) -> list[dict[str, Any]]:
    paper_entity = _get_or_create_entity(
        {"name": corpus_item["title"], "entity_type": "Paper", "confidence": 0.9},
        store,
    )
    entities_by_id = {entity["id"]: entity for entity in store["knowledge_entities"]}
    by_chunk: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for mention in mentions:
        by_chunk[mention["chunk_id"]].append(mention)

    relations: list[dict[str, Any]] = []
    for chunk_id, chunk_mentions in by_chunk.items():
        unique_mentions = list({mention["entity_id"]: mention for mention in chunk_mentions}.values())
        for mention in unique_mentions:
            if not _relation_exists(store, paper_entity["id"], mention["entity_id"], RelationType.mentioned_in.value, chunk_id):
                relation = {
                    "id": str(uuid4()),
                    "source_entity_id": paper_entity["id"],
                    "target_entity_id": mention["entity_id"],
                    "relation_type": RelationType.mentioned_in.value,
                    "evidence_corpus_item_id": corpus_item["id"],
                    "evidence_chunk_id": chunk_id,
                    "confidence": 0.62,
                }
                store["knowledge_relations"].append(relation)
                relations.append(relation)

        for index, left in enumerate(unique_mentions):
            for right in unique_mentions[index + 1 :]:
                left_entity = entities_by_id[left["entity_id"]]
                right_entity = entities_by_id[right["entity_id"]]
                left_type = left_entity["entity_type"]
                right_type = right_entity["entity_type"]
                relation_type = RelationType.related_to.value
                if {left_type, right_type} & {"Heritage", "IntangibleHeritage", "Building"} and {left_type, right_type} & {"Place"}:
                    relation_type = RelationType.located_in.value
                if _relation_exists(store, left["entity_id"], right["entity_id"], relation_type, chunk_id):
                    continue
                relation = {
                    "id": str(uuid4()),
                    "source_entity_id": left["entity_id"],
                    "target_entity_id": right["entity_id"],
                    "relation_type": relation_type,
                    "evidence_corpus_item_id": corpus_item["id"],
                    "evidence_chunk_id": chunk_id,
                    "confidence": 0.55,
                }
                store["knowledge_relations"].append(relation)
                relations.append(relation)
    return relations


def import_file(source_path: str | Path) -> dict[str, Any]:
    store = load_store()
    job = {"id": str(uuid4()), "job_type": "ingestion", "status": "running", "source_path": str(source_path), "result": {}, "created_at": _now()}
    store["ingestion_jobs"].append(job)
    try:
        document = normalize_document(parse_file(source_path))
        duplicate = deduplicate_document(document, store)
        if duplicate:
            existing_item = next((item for item in store["corpus_items"] if item["id"] == duplicate["duplicate_of"]), None)
            job["status"] = "completed"
            job["result"] = {
                "duplicate": duplicate,
                "duplicate_of": duplicate["duplicate_of"],
                "chunks": 0,
                "entity_mentions": 0,
                "relations": 0,
                "embedding_jobs": 0,
            }
            save_store(store)
            return {"status": "completed", "job": job, "corpus_item": existing_item}

        corpus_item = create_corpus_item(document, store)
        chunks: list[dict[str, Any]] = []
        mentions: list[dict[str, Any]] = []
        relations: list[dict[str, Any]] = []
        embedding_jobs: list[dict[str, Any]] = []
        chunks = create_document_chunks(corpus_item, document, store)
        mentions = create_entity_mentions(corpus_item, chunks, store)
        relations = generate_basic_relations(corpus_item, mentions, store)
        embedding_jobs = [create_embedding_job(chunk, store) for chunk in chunks]
        job["status"] = "completed"
        job["result"] = {
            "corpus_item_id": corpus_item["id"],
            "duplicate": duplicate,
            "chunks": len(chunks),
            "entity_mentions": len(mentions),
            "relations": len(relations),
            "embedding_jobs": len(embedding_jobs),
        }
        save_store(store)
        return {"status": "completed", "job": job, "corpus_item": corpus_item}
    except Exception as exc:
        job["status"] = "failed"
        job["result"] = {"error": str(exc)}
        save_store(store)
        return {"status": "failed", "job": job}


def import_directory(directory: str | Path | None = None) -> dict[str, Any]:
    target = Path(directory) if directory else IMPORTS_DIR
    files = [item for item in sorted(target.rglob("*")) if is_supported_file(item)]
    results = [import_file(path) for path in files]
    return {
        "status": "completed",
        "directory": str(target),
        "discovered": len(files),
        "imported": sum(1 for result in results if result["status"] == "completed" and not result["job"]["result"].get("duplicate")),
        "duplicates": sum(1 for result in results if result["status"] == "completed" and result["job"]["result"].get("duplicate")),
        "failed": sum(1 for result in results if result["status"] == "failed"),
        "results": results,
    }


def store_summary() -> dict[str, int]:
    store = load_store()
    return {key: len(value) for key, value in store.items()}
