from fastapi import APIRouter, HTTPException

from app.services.atlas_service import EVENTS, HERITAGE, INTANGIBLE, MUSEUMS, REGIONS, RESEARCH, TIMELINE, get_object

router = APIRouter()


@router.get("/regions")
def regions() -> dict:
    return {"items": REGIONS}


@router.get("/heritage")
def heritage(era: str | None = None) -> dict:
    items = [item for item in HERITAGE if not era or era == "全部" or item.get("era") == era]
    return {"items": items, "timeline": TIMELINE}


@router.get("/intangible-heritage")
def intangible_heritage(era: str | None = None) -> dict:
    items = [item for item in INTANGIBLE if not era or era == "全部" or item.get("era") == era]
    return {"items": items}


@router.get("/museums")
def museums(era: str | None = None) -> dict:
    items = [item for item in MUSEUMS if not era or era == "全部" or item.get("era") == era]
    return {"items": items}


@router.get("/events")
def events(era: str | None = None) -> dict:
    items = [item for item in EVENTS if not era or era == "全部" or item.get("era") == era]
    return {"items": items}


@router.get("/research")
def research() -> dict:
    return {"items": RESEARCH}


@router.get("/object/{object_id}")
def object_detail(object_id: str) -> dict:
    item = get_object(object_id)
    if not item:
        raise HTTPException(status_code=404, detail="Map object not found")
    return {"item": item}
