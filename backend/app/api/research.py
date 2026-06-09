from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class FrameworkRequest(BaseModel):
    idea: str


@router.get("/lineage")
def lineage() -> dict:
    return {
        "theory_sources": ["地方学", "天府学", "文化研究", "传播学", "历史学"],
        "themes": ["天府文化", "川菜", "蜀学", "三星堆", "都江堰", "巴蜀文化", "成都城市文化"],
        "methods": ["内容分析", "文本挖掘", "主题模型", "情感分析", "GIS分析", "数字人文"],
        "gaps": ["县域文化遗产 GIS 研究不足", "短视频传播语料缺少跨平台比较", "非遗与文献计量联动不足"],
    }


@router.post("/framework")
def framework(payload: FrameworkRequest) -> dict:
    return {
        "idea": payload.idea,
        "theory": ["媒介化", "文化记忆", "地方认同"],
        "concepts": ["文化符号", "平台叙事", "用户互动"],
        "questions": ["短视频如何重构天府文化公共想象？", "不同平台的文化符号呈现有何差异？"],
        "variables": ["内容类型", "情感倾向", "互动强度", "文化符号密度"],
        "methods": ["内容分析", "主题模型", "情感分析", "半结构访谈"],
        "data_sources": ["抖音", "B站", "微博", "博物馆公开资料"],
        "mermaid": "flowchart LR\nA[研究想法] --> B[理论基础] --> C[核心概念] --> D[研究问题] --> E[方法与数据]",
    }
