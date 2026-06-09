from fastapi import APIRouter
from pydantic import BaseModel

from app.services.news_collector import (
    collect_news_by_keyword,
    collect_news_from_rss,
    collect_url,
    generate_weekly_report,
    latest_weekly_report,
    list_news_items,
    select_for_corpus,
)

router = APIRouter()


class CollectRequest(BaseModel):
    keyword: str | None = None
    rss_url: str | None = None
    source: str | None = None
    limit: int = 10


class CollectUrlRequest(BaseModel):
    url: str


class WeeklyReportRequest(BaseModel):
    week_start: str | None = None
    week_end: str | None = None


class SelectForCorpusRequest(BaseModel):
    news_id: str


@router.post("/collect")
def collect(payload: CollectRequest) -> dict:
    if payload.rss_url:
        return collect_news_from_rss(payload.rss_url, source=payload.source, limit=payload.limit, keyword_filter=payload.keyword)
    if payload.keyword:
        return collect_news_by_keyword(payload.keyword, limit=payload.limit)
    return {"status": "failed", "error": "keyword or rss_url is required"}


@router.post("/collect-url")
def collect_manual_url(payload: CollectUrlRequest) -> dict:
    return collect_url(payload.url)


@router.get("/items")
def items(category: str | None = None, keyword: str | None = None) -> dict:
    return {"items": list_news_items(category=category, keyword=keyword)}


@router.get("/weekly-report")
def weekly_report() -> dict:
    report = latest_weekly_report()
    return {"report": report}


@router.post("/generate-weekly-report")
def generate_report(payload: WeeklyReportRequest) -> dict:
    return {"report": generate_weekly_report(payload.week_start, payload.week_end)}


@router.post("/select-for-corpus")
def select_news(payload: SelectForCorpusRequest) -> dict:
    return select_for_corpus(payload.news_id)
