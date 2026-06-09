from fastapi import APIRouter

router = APIRouter()


@router.get("/layers")
def layers() -> dict:
    return {
        "layers": ["heritage", "architecture", "intangible", "event", "scholar", "literature"],
        "timeline": ["公元前", "秦汉", "三国", "唐宋", "元明清", "民国", "现代"],
    }


@router.get("/points")
def points() -> dict:
    return {
        "items": [
            {
                "name": "三星堆遗址",
                "layer": "heritage",
                "era": "公元前",
                "lat": 31.007,
                "lng": 104.205,
                "keywords": ["古蜀文明", "青铜器", "考古传播"],
            }
        ]
    }
