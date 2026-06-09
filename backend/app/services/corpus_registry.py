from pathlib import Path

from app.schemas.corpus import CorpusLayer, EntityType, RelationType

KNOWLEDGE_BASE_ROOT = Path(__file__).resolve().parents[3] / "knowledge_base"

LAYER_DESCRIPTIONS: dict[CorpusLayer, str] = {
    CorpusLayer.papers: "学术论文库",
    CorpusLayer.gazetteers: "地方志数据库",
    CorpusLayer.ancient_books: "巴蜀古籍数据库",
    CorpusLayer.wechat_articles: "公众号文章库",
    CorpusLayer.web_resources: "公开网页资料库",
    CorpusLayer.images: "图像资料库",
    CorpusLayer.maps: "地图与GIS资料库",
    CorpusLayer.multimedia: "多媒体资料库",
}

SICHUAN_REGIONS = [
    "成都",
    "德阳",
    "绵阳",
    "乐山",
    "眉山",
    "雅安",
    "广元",
    "宜宾",
    "泸州",
    "南充",
    "达州",
    "攀枝花",
    "阿坝州",
    "甘孜州",
    "凉山州",
    "自贡",
    "遂宁",
    "内江",
    "广安",
    "巴中",
    "资阳",
]


def list_corpus_layers() -> list[dict[str, str]]:
    return [
        {
            "key": layer.value,
            "name": description,
            "path": str(KNOWLEDGE_BASE_ROOT / layer.value),
        }
        for layer, description in LAYER_DESCRIPTIONS.items()
    ]


def graph_ontology() -> dict[str, list[str]]:
    return {
        "entity_types": [item.value for item in EntityType],
        "relation_types": [item.value for item in RelationType],
    }


def ingestion_pipeline() -> list[dict[str, str]]:
    return [
        {"step": "discover", "name": "资源发现", "output": "候选URL、上传文件、文献元数据"},
        {"step": "ingest", "name": "原始入库", "output": "corpus_items + 原始文件"},
        {"step": "parse", "name": "格式解析", "output": "正文、目录、页码、图片、表格"},
        {"step": "clean", "name": "文本清洗", "output": "规范化文本、去噪、去重指纹"},
        {"step": "chunk", "name": "语义分块", "output": "document_chunks"},
        {"step": "extract", "name": "实体关系抽取", "output": "entity_mentions + knowledge_relations"},
        {"step": "embed", "name": "向量化", "output": "BGE-M3 / bge-large-zh embeddings"},
        {"step": "index", "name": "混合索引", "output": "pgvector + PostgreSQL全文检索"},
        {"step": "publish", "name": "知识服务", "output": "RAG、图谱、舆图、分析系统"},
    ]
