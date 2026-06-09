from pathlib import Path

from app.schemas.corpus import ParsedDocument
from app.services.parsers.base import build_document


def parse(path: Path) -> ParsedDocument:
    return build_document(path, "txt", path.read_text(encoding="utf-8", errors="ignore"))
