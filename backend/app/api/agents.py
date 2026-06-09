from fastapi import APIRouter

router = APIRouter()


@router.get("")
def list_agents() -> dict:
    return {
        "agents": [
            "文献研究Agent",
            "文脉分析Agent",
            "研究设计Agent",
            "天府学专家Agent",
            "知识图谱Agent",
            "地图分析Agent",
        ]
    }
