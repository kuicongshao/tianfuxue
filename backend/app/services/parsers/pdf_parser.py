from pathlib import Path

from app.schemas.corpus import ParsedDocument
from app.services.parsers.base import build_document


def parse(path: Path) -> ParsedDocument:
    try:
        from pypdf import PdfReader
    except Exception as exc:
        return build_document(path, "pdf", "", {"parser_error": f"pypdf unavailable: {exc}"})

    reader = PdfReader(str(path))
    pages: list[str] = []
    for index, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        pages.append(f"\n\n[page {index + 1}]\n{text}")
    return build_document(path, "pdf", "\n".join(pages), {"page_count": len(reader.pages)})
