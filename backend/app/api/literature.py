from fastapi import APIRouter

router = APIRouter()


@router.get("/search")
def search(q: str = "天府文化") -> dict:
    return {
        "query": q,
        "items": [
            {
                "title": "天府文化的地域生成与现代转化",
                "authors": ["李明"],
                "year": 2021,
                "abstract": "围绕地域文化、城市传播与现代转化展开研究。",
                "citations": 86,
            }
        ],
    }
