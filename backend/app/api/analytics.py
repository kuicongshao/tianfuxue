from fastapi import APIRouter

from app.services.corpus_registry import SICHUAN_REGIONS

router = APIRouter()


@router.get("/literature")
def literature_analytics() -> dict:
    return {
        "keyword_statistics": [],
        "author_statistics": [],
        "institution_statistics": [],
        "annual_publication_trends": [],
        "research_hotspots": ["天府文化", "巴蜀文化", "三星堆传播", "数字人文", "文化遗产"],
        "topic_modeling": {"status": "planned", "methods": ["BERTopic", "LDA", "Top2Vec"]},
        "co_word_analysis": {"status": "planned"},
        "co_citation_analysis": {"status": "planned"},
        "knowledge_evolution": {"status": "planned"},
    }


@router.get("/digital-humanities")
def digital_humanities_analytics() -> dict:
    return {
        "knowledge_graph_analysis": ["centrality", "community_detection", "path_analysis"],
        "gis_spatial_analysis": ["kernel_density", "regional_comparison", "route_reconstruction"],
        "timeline_analysis": ["dynasty", "event_sequence", "topic_evolution"],
        "cultural_communication_paths": ["museum_to_platform", "heritage_to_city_brand", "scholar_network"],
        "local_studies_lineage": ["地方学", "巴蜀文化", "天府学", "数字人文"],
    }


@router.get("/gis/sichuan")
def sichuan_gis_scope() -> dict:
    return {
        "regions": SICHUAN_REGIONS,
        "regional_assets": ["文化遗产", "古建筑", "非遗", "历史人物", "历史事件", "研究文献", "关联关系"],
    }
