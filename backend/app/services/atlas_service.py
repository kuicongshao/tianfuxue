from __future__ import annotations

from pathlib import Path
from typing import Any

from app.services.ingestion_service import load_store
from app.services.news_collector import load_news_store

TIMELINE = ["全部", "先秦", "秦汉", "三国", "隋唐", "宋元", "明清", "近代", "现代"]

REGIONS = [
    {"id": "chengdu", "name": "成都", "lat": 30.5728, "lng": 104.0668, "level": "地级市", "area_km2": 14335, "population_million": 21.4, "intro": "成都平原核心城市，天府文化、蜀学、博物馆与城市文化研究重镇。"},
    {"id": "deyang", "name": "德阳", "lat": 31.1269, "lng": 104.398, "level": "地级市", "area_km2": 5911, "population_million": 3.5, "intro": "三星堆所在区域，古蜀文明与现代工业文化并置。"},
    {"id": "mianyang", "name": "绵阳", "lat": 31.4675, "lng": 104.6796, "level": "地级市", "area_km2": 20248, "population_million": 4.9, "intro": "科技城与历史文化资源并重，连接蜀道、三国与现代科技叙事。"},
    {"id": "leshan", "name": "乐山", "lat": 29.5521, "lng": 103.7654, "level": "地级市", "area_km2": 12720, "population_million": 3.2, "intro": "乐山大佛、峨眉山世界遗产与山水佛教文化核心区。"},
    {"id": "meishan", "name": "眉山", "lat": 30.0756, "lng": 103.8485, "level": "地级市", "area_km2": 7134, "population_million": 3.0, "intro": "三苏文化和宋代文脉研究的重要区域。"},
    {"id": "yaan", "name": "雅安", "lat": 30.0154, "lng": 103.0398, "level": "地级市", "area_km2": 15046, "population_million": 1.4, "intro": "茶文化、茶马古道与大熊猫文化研究节点。"},
    {"id": "yibin", "name": "宜宾", "lat": 28.7513, "lng": 104.6417, "level": "地级市", "area_km2": 13283, "population_million": 4.6, "intro": "长江首城、酒文化与南丝路文化交汇区。"},
    {"id": "luzhou", "name": "泸州", "lat": 28.8718, "lng": 105.4423, "level": "地级市", "area_km2": 12232, "population_million": 4.3, "intro": "酒文化、长江文化与川南地方社会研究区域。"},
    {"id": "guangyuan", "name": "广元", "lat": 32.4355, "lng": 105.8436, "level": "地级市", "area_km2": 16319, "population_million": 2.3, "intro": "蜀道文化、剑门关和三国交通史研究重镇。"},
    {"id": "dazhou", "name": "达州", "lat": 31.2096, "lng": 107.4679, "level": "地级市", "area_km2": 16591, "population_million": 5.4, "intro": "川东北地方文化、巴文化与区域交通研究节点。"},
    {"id": "nanchong", "name": "南充", "lat": 30.8373, "lng": 106.1107, "level": "地级市", "area_km2": 12479, "population_million": 5.6, "intro": "嘉陵江文化、丝绸文化与三国文化资源集中区。"},
    {"id": "panzhihua", "name": "攀枝花", "lat": 26.5823, "lng": 101.7186, "level": "地级市", "area_km2": 7440, "population_million": 1.2, "intro": "南向通道、移民城市文化与工业遗产研究区域。"},
    {"id": "aba", "name": "阿坝州", "lat": 31.8994, "lng": 102.2247, "level": "自治州", "area_km2": 84242, "population_million": 0.8, "intro": "藏羌文化、九寨黄龙世界遗产与民族文化研究区域。"},
    {"id": "ganzi", "name": "甘孜州", "lat": 30.0495, "lng": 101.9625, "level": "自治州", "area_km2": 149700, "population_million": 1.1, "intro": "康巴文化、茶马古道和川藏交流研究核心区域。"},
    {"id": "liangshan", "name": "凉山州", "lat": 27.8816, "lng": 102.2677, "level": "自治州", "area_km2": 60423, "population_million": 4.9, "intro": "彝族文化、南方丝路和多民族文化交流研究区域。"},
    {"id": "zigong", "name": "自贡", "lat": 29.3392, "lng": 104.7784, "level": "地级市", "area_km2": 4381, "population_million": 2.5, "intro": "盐业文化、灯会文化与工业遗产研究城市。"},
    {"id": "suining", "name": "遂宁", "lat": 30.5329, "lng": 105.5926, "level": "地级市", "area_km2": 5322, "population_million": 2.8, "intro": "观音文化、涪江流域与川中地方文化研究区域。"},
    {"id": "neijiang", "name": "内江", "lat": 29.5802, "lng": 105.0584, "level": "地级市", "area_km2": 5385, "population_million": 3.1, "intro": "甜城文化、川南交通与地方文献研究区域。"},
    {"id": "guangan", "name": "广安", "lat": 30.4559, "lng": 106.6333, "level": "地级市", "area_km2": 6339, "population_million": 3.2, "intro": "川东门户、红色文化与巴文化研究区域。"},
    {"id": "bazhong", "name": "巴中", "lat": 31.8679, "lng": 106.7475, "level": "地级市", "area_km2": 12325, "population_million": 2.7, "intro": "川陕苏区、米仓古道与巴文化研究区域。"},
    {"id": "ziyang", "name": "资阳", "lat": 30.1292, "lng": 104.6276, "level": "地级市", "area_km2": 5747, "population_million": 2.3, "intro": "成渝轴线节点，石刻、交通与地方文化研究区域。"},
]

HERITAGE = [
    {"id": "dujiangyan", "name": "都江堰水利工程", "layer": "heritage", "category": "世界遗产", "era": "秦汉", "lat": 30.991, "lng": 103.618, "intro": "战国秦蜀郡太守李冰主持修建的大型水利工程，是成都平原农耕文明与水文化核心遗产。", "keywords": ["李冰", "水文化", "成都平原", "世界遗产"], "region": "成都", "related_literature": ["都江堰水利史", "华阳国志"]},
    {"id": "sanxingdui", "name": "三星堆遗址", "layer": "heritage", "category": "全国重点文保单位", "era": "先秦", "lat": 31.007, "lng": 104.205, "intro": "古蜀文明重要遗址，青铜器、祭祀坑与博物馆传播研究价值突出。", "keywords": ["古蜀文明", "考古发现", "青铜器"], "region": "德阳", "related_literature": ["三星堆与古蜀文明研究"]},
    {"id": "jinsha", "name": "金沙遗址", "layer": "heritage", "category": "全国重点文保单位", "era": "先秦", "lat": 30.683, "lng": 104.014, "intro": "成都平原古蜀文明中心遗址，与三星堆共同构成古蜀文化谱系。", "keywords": ["古蜀文明", "太阳神鸟", "成都"], "region": "成都", "related_literature": ["金沙遗址考古报告"]},
    {"id": "leshan-buddha", "name": "乐山大佛", "layer": "heritage", "category": "世界遗产", "era": "隋唐", "lat": 29.547, "lng": 103.773, "intro": "唐代摩崖造像代表，与峨眉山共同构成世界文化与自然遗产。", "keywords": ["佛教文化", "摩崖造像", "世界遗产"], "region": "乐山", "related_literature": ["乐山大佛保护研究"]},
    {"id": "jianmen-pass", "name": "剑门关蜀道", "layer": "heritage", "category": "全国重点文保单位", "era": "三国", "lat": 32.212, "lng": 105.565, "intro": "蜀道文化核心节点，连接交通史、军事史与诗歌地理研究。", "keywords": ["蜀道", "三国", "交通史"], "region": "广元", "related_literature": ["蜀道文化研究"]},
]

INTANGIBLE = [
    {"id": "sichuan-opera", "name": "川剧", "layer": "intangible", "level": "国家级", "category": "传统戏剧", "region": "四川", "lat": 30.657, "lng": 104.066, "intro": "四川代表性地方戏曲，变脸、声腔与城市文化传播研究价值突出。", "keywords": ["非遗", "戏曲", "变脸"], "era": "明清"},
    {"id": "shu-embroidery", "name": "蜀绣", "layer": "intangible", "level": "国家级", "category": "传统美术", "region": "成都", "lat": 30.673, "lng": 104.063, "intro": "中国四大名绣之一，体现成都手工艺和审美传统。", "keywords": ["非遗", "传统工艺", "成都"], "era": "宋元"},
    {"id": "pixian-douban", "name": "郫县豆瓣制作技艺", "layer": "intangible", "level": "国家级", "category": "传统技艺", "region": "成都", "lat": 30.81, "lng": 103.887, "intro": "川菜味型基础技艺，与川菜文化和地方产业研究密切相关。", "keywords": ["川菜文化", "传统技艺", "郫都"], "era": "明清"},
    {"id": "mengshan-tea", "name": "蒙山茶制作技艺", "layer": "intangible", "level": "国家级", "category": "传统技艺", "region": "雅安", "lat": 30.061, "lng": 103.106, "intro": "蒙顶山茶文化代表性技艺，关联茶马古道与茶文化传播。", "keywords": ["茶文化", "茶马古道", "雅安"], "era": "隋唐"},
    {"id": "qingcheng-bamboo", "name": "竹编", "layer": "intangible", "level": "省级", "category": "传统技艺", "region": "成都", "lat": 30.904, "lng": 103.563, "intro": "川西民间工艺代表，体现地方生活美学。", "keywords": ["竹编", "传统工艺"], "era": "明清"},
]

MUSEUMS = [
    {"id": "sanxingdui-museum", "name": "三星堆博物馆", "layer": "museum", "lat": 31.007, "lng": 104.205, "region": "德阳", "intro": "集中展示三星堆考古成果和古蜀文明。", "keywords": ["博物馆", "古蜀文明"], "era": "现代"},
    {"id": "jinsha-museum", "name": "金沙遗址博物馆", "layer": "museum", "lat": 30.683, "lng": 104.014, "region": "成都", "intro": "展示金沙遗址与成都古蜀文化。", "keywords": ["博物馆", "金沙遗址"], "era": "现代"},
    {"id": "sichuan-museum", "name": "四川博物院", "layer": "museum", "lat": 30.657, "lng": 104.035, "region": "成都", "intro": "四川省综合性博物馆，收藏巴蜀文化重要文物。", "keywords": ["博物馆", "巴蜀文化"], "era": "现代"},
    {"id": "chengdu-museum", "name": "成都博物馆", "layer": "museum", "lat": 30.659, "lng": 104.063, "region": "成都", "intro": "成都城市历史和天府文化展示中心。", "keywords": ["成都文化", "城市史"], "era": "现代"},
    {"id": "wuhou-shrine", "name": "成都武侯祠", "layer": "museum", "lat": 30.642, "lng": 104.046, "region": "成都", "intro": "三国文化纪念空间，兼具博物馆与历史景观属性。", "keywords": ["三国", "诸葛亮"], "era": "三国"},
    {"id": "dufu-cottage", "name": "杜甫草堂", "layer": "museum", "lat": 30.659, "lng": 104.028, "region": "成都", "intro": "唐代诗人杜甫寓居成都遗址，诗歌地理研究重地。", "keywords": ["杜甫", "唐诗", "成都"], "era": "隋唐"},
]

EVENTS = [
    {"id": "li-bing-dujiangyan", "name": "李冰修建都江堰", "layer": "event", "place": "都江堰", "era": "秦汉", "lat": 30.991, "lng": 103.618, "intro": "秦蜀郡太守李冰主持修建都江堰，奠定成都平原水利农业基础。", "people": ["李冰"], "related_literature": ["华阳国志", "都江堰水利史"], "keywords": ["水利", "农耕文明"]},
    {"id": "sanxingdui-discovery", "name": "三星堆考古发现", "layer": "event", "place": "广汉", "era": "现代", "lat": 31.007, "lng": 104.205, "intro": "三星堆多次考古发现推动古蜀文明研究和公众传播。", "people": [], "related_literature": ["三星堆考古报告"], "keywords": ["考古发现", "古蜀文明"]},
    {"id": "dufu-chengdu", "name": "杜甫寓居成都", "layer": "event", "place": "成都", "era": "隋唐", "lat": 30.659, "lng": 104.028, "intro": "杜甫在成都草堂创作大量诗篇，构成成都文学地理的重要节点。", "people": ["杜甫"], "related_literature": ["杜诗研究"], "keywords": ["唐诗", "城市文化"]},
]

RESEARCH = [
    {"object_id": "dujiangyan", "paper_count": 128, "topics": ["水文化", "世界遗产", "工程史", "成都平原"], "scholars": ["李明", "王岚"], "keywords": ["李冰", "农耕文明", "水利"], "trend": "近年研究从工程史扩展到遗产传播与生态治理。"},
    {"object_id": "sanxingdui", "paper_count": 246, "topics": ["古蜀文明", "博物馆传播", "考古发现", "数字展陈"], "scholars": ["陈川", "赵蓉"], "keywords": ["青铜器", "古蜀", "公共考古"], "trend": "短视频传播和数字博物馆成为新增热点。"},
    {"object_id": "jinsha", "paper_count": 96, "topics": ["古蜀文明", "太阳神鸟", "城市认同"], "scholars": ["刘颖"], "keywords": ["成都", "金沙", "文化符号"], "trend": "城市品牌与文化符号研究持续增长。"},
]

GRAPH = {
    "dujiangyan": {"nodes": ["都江堰", "李冰", "水文化", "农耕文明", "成都平原", "世界遗产"], "edges": [["都江堰", "李冰", "创建于"], ["都江堰", "水文化", "关联"], ["都江堰", "成都平原", "位于"], ["都江堰", "世界遗产", "属于"], ["水文化", "农耕文明", "影响"]]},
    "sanxingdui": {"nodes": ["三星堆", "古蜀文明", "青铜器", "博物馆传播", "考古发现"], "edges": [["三星堆", "古蜀文明", "属于"], ["三星堆", "青铜器", "关联"], ["三星堆", "考古发现", "发现于"], ["三星堆", "博物馆传播", "传播"]]},
}


def all_layers() -> dict[str, list[dict[str, Any]]]:
    return {"heritage": HERITAGE, "intangible_heritage": INTANGIBLE, "museums": MUSEUMS, "events": EVENTS}


def list_objects(layer: str | None = None, era: str | None = None) -> list[dict[str, Any]]:
    objects = HERITAGE + INTANGIBLE + MUSEUMS + EVENTS
    if layer:
        objects = [item for item in objects if item.get("layer") == layer]
    if era and era != "全部":
        objects = [item for item in objects if item.get("era") == era]
    return objects


def get_object(object_id: str) -> dict[str, Any] | None:
    item = next((candidate for candidate in list_objects() if candidate["id"] == object_id), None)
    if not item:
        return None
    research = next((entry for entry in RESEARCH if entry["object_id"] == object_id), None)
    graph = GRAPH.get(object_id, {"nodes": [item["name"]], "edges": []})
    return {**item, "research": research, "graph": graph, "literature": related_literature(item)}


def related_literature(item: dict[str, Any]) -> dict[str, Any]:
    keywords = set(item.get("keywords", []) + [item.get("name", "")])
    corpus = load_store()
    news = load_news_store()
    papers = []
    for corpus_item in corpus["corpus_items"]:
        haystack = f"{corpus_item.get('title', '')} {' '.join(corpus_item.get('keywords', []))} {corpus_item.get('abstract') or ''}"
        if any(keyword and keyword in haystack for keyword in keywords):
            papers.append({"title": corpus_item["title"], "id": corpus_item["id"], "source_path": corpus_item.get("source_path")})
    news_items = []
    for news_item in news["culture_news_items"]:
        haystack = f"{news_item.get('title', '')} {news_item.get('summary', '')} {' '.join(news_item.get('keywords', []))}"
        if any(keyword and keyword in haystack for keyword in keywords):
            news_items.append({"title": news_item["title"], "source_url": news_item["source_url"], "category": news_item["category"]})
    return {"papers": papers[:8], "gazetteers": item.get("related_literature", [])[:5], "ancient_books": [], "news": news_items[:8], "hotspots": item.get("keywords", [])[:8]}
