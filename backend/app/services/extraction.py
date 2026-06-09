from app.schemas.corpus import EntityType, RelationType

ENTITY_KEYWORDS: dict[EntityType, list[str]] = {
    EntityType.place: ["成都", "四川", "都江堰", "广汉", "三星堆", "乐山", "峨眉山"],
    EntityType.person: ["李冰", "诸葛亮", "扬雄", "苏轼", "李白", "杜甫"],
    EntityType.dynasty: ["秦", "汉", "三国", "唐", "宋", "元", "明", "清", "民国"],
    EntityType.heritage: ["三星堆", "都江堰", "青城山", "大熊猫栖息地"],
    EntityType.intangible_heritage: ["川剧", "蜀锦", "蜀绣", "竹琴"],
    EntityType.building: ["武侯祠", "杜甫草堂", "文殊院"],
    EntityType.theory: ["地方认同", "文化记忆", "媒介化", "地方学"],
    EntityType.method: ["文本挖掘", "主题模型", "情感分析", "GIS分析", "内容分析"],
}


def extract_entities(text: str) -> list[dict[str, str | float]]:
    mentions: list[dict[str, str | float]] = []
    for entity_type, keywords in ENTITY_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text:
                mentions.append(
                    {
                        "surface_text": keyword,
                        "entity_type": entity_type.value,
                        "extractor": "keyword-mvp",
                        "confidence": 0.72,
                    }
                )
    return mentions


def infer_relations(entities: list[dict[str, str | float]]) -> list[dict[str, str | float]]:
    names = {str(item["surface_text"]) for item in entities}
    relations: list[dict[str, str | float]] = []
    if {"三星堆", "广汉"} <= names:
        relations.append({"source": "三星堆", "target": "广汉", "relation_type": RelationType.discovered_at.value, "confidence": 0.68})
    if {"都江堰", "李冰"} <= names:
        relations.append({"source": "都江堰", "target": "李冰", "relation_type": RelationType.created_in.value, "confidence": 0.66})
    if {"川剧", "四川"} <= names:
        relations.append({"source": "川剧", "target": "四川", "relation_type": RelationType.belongs_to.value, "confidence": 0.70})
    return relations
