from pathlib import Path

from app.schemas.corpus import ParsedDocument
from app.services.parsers.base import build_document


def flatten(value: object) -> str:
    if isinstance(value, dict):
        return "\n".join(f"{key}: {flatten(item)}" for key, item in value.items())
    if isinstance(value, list):
        return "\n".join(flatten(item) for item in value)
    return "" if value is None else str(value)


def parse(path: Path) -> ParsedDocument:
    import json

    data = json.loads(path.read_text(encoding="utf-8", errors="ignore"))
    document = build_document(path, "json", flatten(data), {"json_root_type": type(data).__name__})
    if isinstance(data, dict):
        document.title = str(data.get("title") or data.get("name") or document.title)
        document.authors = data.get("authors") or data.get("author") or document.authors
        if isinstance(document.authors, str):
            document.authors = [document.authors]
        document.abstract = data.get("abstract") or data.get("summary") or document.abstract
        keywords = data.get("keywords") or document.keywords
        document.keywords = keywords if isinstance(keywords, list) else [str(keywords)]
    return document
