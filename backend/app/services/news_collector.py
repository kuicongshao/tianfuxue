from __future__ import annotations

import hashlib
import json
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from html.parser import HTMLParser
from pathlib import Path
from typing import Any
from uuid import uuid4

from app.core.config import settings
from app.schemas.corpus import ParsedDocument
from app.services.corpus_registry import KNOWLEDGE_BASE_ROOT
from app.services.entity_extractor import extract_entities_from_text
from app.services.ingestion_service import import_file

NEWS_STORE_PATH = KNOWLEDGE_BASE_ROOT / "processed" / "news_store.json"
SELECTED_NEWS_DIR = KNOWLEDGE_BASE_ROOT / "imports" / "selected_news"

NEWS_KEYWORDS = [
    "四川文化",
    "天府文化",
    "巴蜀文化",
    "成都文化",
    "四川文旅",
    "成都文旅",
    "四川非遗",
    "四川博物馆",
    "三星堆",
    "金沙遗址",
    "都江堰",
    "蜀道",
    "川菜文化",
    "茶馆文化",
    "大熊猫文化",
    "四川考古",
    "地方志",
    "天府学",
    "巴蜀文脉",
    "文化遗产",
    "数字文化",
    "文化数字化",
]

DEFAULT_RSS_SOURCES = [
    {"source": "人民网四川频道", "url": "http://sc.people.com.cn/rss/news.xml"},
    {"source": "新华网四川频道", "url": "http://www.sc.xinhuanet.com/rss.xml"},
]

CATEGORIES = {
    "文旅政策": ["政策", "条例", "规划", "行动方案", "文旅厅", "文化和旅游厅"],
    "文化遗产": ["文化遗产", "文物", "保护", "遗址", "古建", "蜀道", "都江堰"],
    "非遗传承": ["非遗", "传承", "川剧", "蜀锦", "蜀绣"],
    "博物馆展览": ["博物馆", "展览", "展出", "馆藏", "策展"],
    "考古发现": ["考古", "发掘", "遗址", "三星堆", "金沙"],
    "地方学研究": ["地方学", "天府学", "巴蜀文化", "地方志", "学术研讨"],
    "城市文化": ["成都文化", "城市文化", "街区", "茶馆", "川菜"],
    "数字文化": ["数字文化", "文化数字化", "数字人文", "数字文旅"],
    "国际传播": ["国际传播", "海外", "对外", "全球", "国际交流"],
}

REGIONS = ["成都", "德阳", "绵阳", "乐山", "眉山", "雅安", "广元", "宜宾", "泸州", "南充", "达州", "攀枝花", "阿坝", "甘孜", "凉山", "四川"]


class _MetadataParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_title = False
        self.title = ""
        self.meta: dict[str, str] = {}

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_dict = {key.lower(): value or "" for key, value in attrs}
        if tag.lower() == "title":
            self.in_title = True
        if tag.lower() == "meta":
            key = attrs_dict.get("property") or attrs_dict.get("name")
            value = attrs_dict.get("content")
            if key and value:
                self.meta[key.lower()] = value

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "title":
            self.in_title = False

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.title += data.strip()


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _empty_store() -> dict[str, list[dict[str, Any]]]:
    return {"culture_news_items": [], "weekly_news_reports": []}


def load_news_store() -> dict[str, list[dict[str, Any]]]:
    NEWS_STORE_PATH.parent.mkdir(parents=True, exist_ok=True)
    if not NEWS_STORE_PATH.exists():
        return _empty_store()
    data = json.loads(NEWS_STORE_PATH.read_text(encoding="utf-8"))
    store = _empty_store()
    store.update(data)
    return store


def save_news_store(store: dict[str, list[dict[str, Any]]]) -> None:
    NEWS_STORE_PATH.parent.mkdir(parents=True, exist_ok=True)
    store["culture_news_items"] = cleanup_old_news(store["culture_news_items"])
    NEWS_STORE_PATH.write_text(json.dumps(store, ensure_ascii=False, indent=2), encoding="utf-8")


def cleanup_old_news(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    cutoff = datetime.now(timezone.utc) - timedelta(weeks=settings.news_cache_weeks)
    kept = []
    for item in items:
        if item.get("is_selected") or item.get("is_archived"):
            kept.append(item)
            continue
        collected_at = _parse_datetime(item.get("collected_at")) or datetime.now(timezone.utc)
        if collected_at >= cutoff:
            kept.append(item)
    return kept


def collect_news_by_keyword(keyword: str, limit: int = 10) -> dict[str, Any]:
    query = urllib.parse.quote(f"{keyword} 四川 文化")
    rss_url = f"https://www.bing.com/news/search?q={query}&format=rss"
    return collect_news_from_rss(rss_url, source=f"Keyword:{keyword}", limit=limit, keyword_filter=keyword)


def collect_news_from_rss(rss_url: str, source: str | None = None, limit: int = 20, keyword_filter: str | None = None) -> dict[str, Any]:
    store = load_news_store()
    try:
        xml_text = _fetch_url(rss_url)
        candidates = _parse_rss(xml_text, source or rss_url)
    except Exception as exc:
        return {"status": "failed", "error": str(exc), "items": []}

    imported = []
    duplicates = 0
    for candidate in candidates[:limit]:
        haystack = f"{candidate['title']} {candidate.get('summary', '')}"
        if keyword_filter and keyword_filter not in haystack:
            continue
        item = _build_news_item(candidate)
        duplicate = deduplicate_news(item, store)
        if duplicate:
            duplicates += 1
            continue
        store["culture_news_items"].append(item)
        imported.append(item)
    save_news_store(store)
    return {"status": "completed", "imported": len(imported), "duplicates": duplicates, "items": imported}


def fetch_article_metadata(url: str) -> dict[str, Any]:
    html = _fetch_url(url)
    parser = _MetadataParser()
    parser.feed(html[:200_000])
    title = parser.meta.get("og:title") or parser.meta.get("twitter:title") or parser.title or url
    summary = parser.meta.get("og:description") or parser.meta.get("description") or ""
    published_at = parser.meta.get("article:published_time")
    return {
        "title": _clean_text(title),
        "source": urllib.parse.urlparse(url).netloc,
        "source_url": url,
        "published_at": published_at,
        "summary": generate_summary(summary or title),
    }


def collect_url(url: str) -> dict[str, Any]:
    store = load_news_store()
    try:
        metadata = fetch_article_metadata(url)
        item = _build_news_item(metadata)
    except Exception as exc:
        return {"status": "failed", "error": str(exc)}
    duplicate = deduplicate_news(item, store)
    if duplicate:
        return {"status": "duplicate", "duplicate_of": duplicate["id"], "item": duplicate}
    store["culture_news_items"].append(item)
    save_news_store(store)
    return {"status": "completed", "item": item}


def clean_article_text(text: str) -> str:
    return _clean_text(text)


def deduplicate_news(item: dict[str, Any], store: dict[str, list[dict[str, Any]]]) -> dict[str, Any] | None:
    for existing in store["culture_news_items"]:
        if existing.get("checksum") == item.get("checksum"):
            return existing
        if existing.get("source_url") and existing.get("source_url") == item.get("source_url"):
            return existing
    return None


def classify_news(text: str) -> str:
    for category, words in CATEGORIES.items():
        if any(word in text for word in words):
            return category
    return "其他"


def extract_entities(text: str) -> list[dict[str, Any]]:
    return extract_entities_from_text(text)


def generate_summary(text: str, max_length: int = 180) -> str:
    cleaned = _clean_text(text)
    if len(cleaned) <= max_length:
        return cleaned
    sentence = re.split(r"[。！？!?]", cleaned)[0]
    return (sentence if 20 <= len(sentence) <= max_length else cleaned[:max_length]).strip(" ，,。")


def generate_weekly_report(week_start: str | None = None, week_end: str | None = None) -> dict[str, Any]:
    store = load_news_store()
    start, end = _week_range(week_start, week_end)
    items = [item for item in store["culture_news_items"] if _in_range(item, start, end)]
    topic_counts = _count(items, "category")
    region_counts = _region_counts(items)
    entity_counts = _entity_counts(items)
    selected = sorted(items, key=lambda item: (item.get("published_at") or item.get("collected_at") or ""), reverse=True)[:8]
    report_markdown = _weekly_report_markdown(start, end, items, topic_counts, region_counts, entity_counts, selected)
    report = {
        "id": str(uuid4()),
        "week_start": start.date().isoformat(),
        "week_end": end.date().isoformat(),
        "title": "四川文化新闻周报",
        "summary": f"本周共跟踪 {len(items)} 条四川文化相关资讯，热点包括：{', '.join(list(topic_counts)[:5]) or '暂无'}。",
        "main_topics": list(topic_counts.keys())[:8],
        "news_count": len(items),
        "report_markdown": report_markdown,
        "created_at": _now(),
    }
    store["weekly_news_reports"].append(report)
    save_news_store(store)
    return report


def select_for_corpus(news_id: str) -> dict[str, Any]:
    store = load_news_store()
    item = next((candidate for candidate in store["culture_news_items"] if candidate["id"] == news_id), None)
    if not item:
        return {"status": "failed", "error": "news item not found"}
    SELECTED_NEWS_DIR.mkdir(parents=True, exist_ok=True)
    path = SELECTED_NEWS_DIR / f"selected_news_{news_id}.md"
    markdown = "\n".join(
        [
            f"# {item['title']}",
            "",
            f"来源：{item['source']}",
            f"链接：{item['source_url']}",
            f"发布时间：{item.get('published_at') or ''}",
            f"分类：{item['category']}",
            f"关键词：{'，'.join(item['keywords'])}",
            "",
            item["summary"],
        ]
    )
    path.write_text(markdown, encoding="utf-8")
    result = import_file(path)
    item["is_selected"] = True
    item["status"] = "selected_for_corpus"
    item["corpus_result"] = result.get("job", {}).get("result", {})
    item["updated_at"] = _now()
    save_news_store(store)
    return {"status": "completed", "news_item": item, "corpus_import": result}


def list_news_items(category: str | None = None, keyword: str | None = None) -> list[dict[str, Any]]:
    items = load_news_store()["culture_news_items"]
    if category:
        items = [item for item in items if item.get("category") == category]
    if keyword:
        items = [item for item in items if keyword in f"{item.get('title', '')} {item.get('summary', '')} {' '.join(item.get('keywords', []))}"]
    return sorted(items, key=lambda item: item.get("published_at") or item.get("collected_at") or "", reverse=True)


def latest_weekly_report() -> dict[str, Any] | None:
    reports = load_news_store()["weekly_news_reports"]
    return reports[-1] if reports else None


def _fetch_url(url: str) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": "TianfuStudiesNewsAgent/0.1"})
    with urllib.request.urlopen(request, timeout=12) as response:
        charset = response.headers.get_content_charset() or "utf-8"
        return response.read().decode(charset, errors="ignore")


def _parse_rss(xml_text: str, default_source: str) -> list[dict[str, Any]]:
    root = ET.fromstring(xml_text)
    items = []
    for node in root.findall(".//item"):
        title = _node_text(node, "title")
        link = _node_text(node, "link")
        summary = _node_text(node, "description")
        published = _node_text(node, "pubDate")
        source = _node_text(node, "source") or default_source
        if title and link:
            items.append({"title": title, "source": source, "source_url": link, "summary": summary, "published_at": _parse_rss_date(published)})
    for node in root.findall(".//{http://www.w3.org/2005/Atom}entry"):
        title = _node_text(node, "{http://www.w3.org/2005/Atom}title")
        link_node = node.find("{http://www.w3.org/2005/Atom}link")
        link = link_node.attrib.get("href", "") if link_node is not None else ""
        summary = _node_text(node, "{http://www.w3.org/2005/Atom}summary")
        published = _node_text(node, "{http://www.w3.org/2005/Atom}updated")
        if title and link:
            items.append({"title": title, "source": default_source, "source_url": link, "summary": summary, "published_at": published})
    return items


def _build_news_item(candidate: dict[str, Any]) -> dict[str, Any]:
    title = _clean_text(candidate.get("title") or "")
    summary = generate_summary(candidate.get("summary") or title)
    text = f"{title}\n{summary}"
    entities = extract_entities(text)
    keywords = _extract_keywords(text, entities)
    category = classify_news(text)
    region = _detect_region(text)
    checksum = hashlib.sha256(f"{title}|{candidate.get('source_url', '')}".encode("utf-8")).hexdigest()
    return {
        "id": str(uuid4()),
        "title": title,
        "source": candidate.get("source") or "",
        "source_url": candidate.get("source_url") or "",
        "published_at": candidate.get("published_at"),
        "collected_at": _now(),
        "summary": summary,
        "keywords": keywords,
        "category": category,
        "region": region,
        "related_entities": [{"name": entity["name"], "entity_type": entity["entity_type"]} for entity in entities],
        "checksum": checksum,
        "status": "collected",
        "is_archived": False,
        "is_selected": False,
        "created_at": _now(),
        "updated_at": _now(),
    }


def _extract_keywords(text: str, entities: list[dict[str, Any]]) -> list[str]:
    words = [keyword for keyword in NEWS_KEYWORDS if keyword in text]
    words.extend(entity["name"] for entity in entities[:8])
    return sorted(set(words))[:12]


def _detect_region(text: str) -> str | None:
    for region in REGIONS:
        if region in text:
            return region
    return None


def _clean_text(text: str) -> str:
    text = re.sub(r"<[^>]+>", " ", text or "")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def _node_text(node: ET.Element, tag: str) -> str:
    child = node.find(tag)
    return _clean_text(child.text) if child is not None and child.text else ""


def _parse_rss_date(value: str) -> str | None:
    if not value:
        return None
    try:
        return parsedate_to_datetime(value).astimezone(timezone.utc).isoformat()
    except Exception:
        return value


def _parse_datetime(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
    except Exception:
        return None


def _week_range(week_start: str | None, week_end: str | None) -> tuple[datetime, datetime]:
    now = datetime.now(timezone.utc)
    start = datetime.fromisoformat(week_start).replace(tzinfo=timezone.utc) if week_start else now - timedelta(days=now.weekday())
    end = datetime.fromisoformat(week_end).replace(tzinfo=timezone.utc) if week_end else start + timedelta(days=6, hours=23, minutes=59)
    return start, end


def _in_range(item: dict[str, Any], start: datetime, end: datetime) -> bool:
    value = _parse_datetime(item.get("published_at")) or _parse_datetime(item.get("collected_at"))
    return bool(value and start <= value <= end)


def _count(items: list[dict[str, Any]], key: str) -> dict[str, int]:
    counts: dict[str, int] = {}
    for item in items:
        value = item.get(key) or "其他"
        counts[value] = counts.get(value, 0) + 1
    return dict(sorted(counts.items(), key=lambda pair: pair[1], reverse=True))


def _region_counts(items: list[dict[str, Any]]) -> dict[str, int]:
    return _count([item for item in items if item.get("region")], "region")


def _entity_counts(items: list[dict[str, Any]]) -> dict[str, int]:
    counts: dict[str, int] = {}
    for item in items:
        for entity in item.get("related_entities", []):
            name = entity.get("name")
            if name:
                counts[name] = counts.get(name, 0) + 1
    return dict(sorted(counts.items(), key=lambda pair: pair[1], reverse=True)[:12])


def _weekly_report_markdown(
    start: datetime,
    end: datetime,
    items: list[dict[str, Any]],
    topic_counts: dict[str, int],
    region_counts: dict[str, int],
    entity_counts: dict[str, int],
    selected: list[dict[str, Any]],
) -> str:
    lines = [
        "# 四川文化新闻周报",
        "",
        f"周期：{start.date().isoformat()} 至 {end.date().isoformat()}",
        "",
        "## 一、本周文化动态概览",
        "",
        f"本周共跟踪 {len(items)} 条四川文化相关资讯。",
        "",
        "## 二、本周重点新闻",
        "",
    ]
    lines.extend([f"- [{item['title']}]({item['source_url']})（{item['source']}，{item['category']}）" for item in selected] or ["- 暂无重点新闻。"])
    lines.extend(["", "## 三、热点主题趋势", ""])
    lines.extend([f"- {topic}: {count}" for topic, count in topic_counts.items()] or ["- 暂无可统计热点。"])
    lines.extend(["", "## 四、地区分布分析", ""])
    lines.extend([f"- {region}: {count}" for region, count in region_counts.items()] or ["- 暂无明确地区分布。"])
    lines.extend(["", "## 五、重要文化实体", ""])
    lines.extend([f"- {entity}: {count}" for entity, count in entity_counts.items()] or ["- 暂无高频实体。"])
    lines.extend(["", "## 六、地方学研究线索", "", "- 关注文化遗产、地方认同、城市文化传播与数字文化建设之间的联动。"])
    lines.extend(["", "## 七、推荐关注方向", "", "- 建议人工筛选高价值报道，点击“精选入库”后再进入 Tianfu Knowledge Base。"])
    return "\n".join(lines)
