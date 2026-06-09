from pathlib import Path

from app.schemas.corpus import ParsedDocument
from app.services.parsers.base import build_document


def parse(path: Path) -> ParsedDocument:
    try:
        from docx import Document
    except Exception as exc:
        return build_document(path, "docx", "", {"parser_error": f"python-docx unavailable: {exc}"})

    document = Document(str(path))
    parts = [paragraph.text for paragraph in document.paragraphs if paragraph.text.strip()]
    return build_document(path, "docx", "\n".join(parts), {"paragraph_count": len(parts)})
