from fastapi import APIRouter, HTTPException

from app.services.atlas_service import EVENTS, HERITAGE, INTANGIBLE, MUSEUMS, REGIONS, RESEARCH, TIMELINE, get_object

router = APIRouter()


def _with_coordinate_metadata(items: list[dict]) -> list[dict]:
    """Coordinate origins are not yet verified; expose this explicitly to clients."""
    return [{**item, "coordinate_system": item.get("coordinate_system", "unknown")} for item in items]


@router.get("/regions")
def regions() -> dict:
    return {"items": _with_coordinate_metadata(REGIONS), "boundary_provider": "tianditu_wmts_base_map"}


@router.get("/heritage")
def heritage(era: str | None = None) -> dict:
    items = [item for item in HERITAGE if not era or era == "全部" or item.get("era") == era]
    return {"items": _with_coordinate_metadata(items), "timeline": TIMELINE}


@router.get("/intangible-heritage")
def intangible_heritage(era: str | None = None) -> dict:
    items = [item for item in INTANGIBLE if not era or era == "全部" or item.get("era") == era]
    return {"items": _with_coordinate_metadata(items)}


@router.get("/museums")
def museums(era: str | None = None) -> dict:
    items = [item for item in MUSEUMS if not era or era == "全部" or item.get("era") == era]
    return {"items": _with_coordinate_metadata(items)}


@router.get("/events")
def events(era: str | None = None) -> dict:
    items = [item for item in EVENTS if not era or era == "全部" or item.get("era") == era]
    return {"items": _with_coordinate_metadata(items)}


@router.get("/research")
def research() -> dict:
    return {"items": RESEARCH}


@router.get("/object/{object_id}")
def object_detail(object_id: str) -> dict:
    item = get_object(object_id)
    if not item:
        raise HTTPException(status_code=404, detail="Map object not found")
    return {"item": {**item, "coordinate_system": item.get("coordinate_system", "unknown")}}
