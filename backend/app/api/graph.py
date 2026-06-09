from fastapi import APIRouter
from pydantic import BaseModel

from app.services.corpus_registry import graph_ontology
from app.services.extraction import extract_entities, infer_relations
from app.services.ingestion_service import load_store

router = APIRouter()


class ExtractRequest(BaseModel):
    text: str


@router.get("/ontology")
def ontology() -> dict:
    return graph_ontology()


@router.post("/extract")
def extract(payload: ExtractRequest) -> dict:
    entities = extract_entities(payload.text)
    relations = infer_relations(entities)
    return {"entities": entities, "relations": relations}


@router.get("/neighborhood/{entity_name}")
def neighborhood(entity_name: str) -> dict:
    return {
        "center": entity_name,
        "nodes": [{"id": entity_name, "type": "Unknown"}],
        "edges": [],
        "note": "MVP endpoint. Connect to knowledge_entities and knowledge_relations for production graph traversal.",
    }


@router.get("/entities")
def entities() -> dict:
    store = load_store()
    return {"items": store["knowledge_entities"]}


@router.get("/relations")
def relations() -> dict:
    store = load_store()
    entities_by_id = {entity["id"]: entity for entity in store["knowledge_entities"]}
    items = []
    for relation in store["knowledge_relations"]:
        items.append(
            {
                **relation,
                "source_name": entities_by_id.get(relation["source_entity_id"], {}).get("name", relation["source_entity_id"]),
                "target_name": entities_by_id.get(relation["target_entity_id"], {}).get("name", relation["target_entity_id"]),
            }
        )
    return {"items": items}
