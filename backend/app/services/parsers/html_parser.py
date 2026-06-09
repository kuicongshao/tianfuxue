from pathlib import Path

from app.schemas.corpus import ParsedDocument
from app.services.parsers.base import build_document


def parse(path: Path) -> ParsedDocument:
    html = path.read_text(encoding="utf-8", errors="ignore")
    try:
        from bs4 import BeautifulSoup

        soup = BeautifulSoup(html, "html.parser")
        for tag in soup(["script", "style", "noscript"]):
            tag.decompose()
        text = soup.get_text("\n")
        title = soup.title.string.strip() if soup.title and soup.title.string else None
        metadata = {"html_title": title}
    except Exception as exc:
        text = html
        metadata = {"parser_warning": str(exc)}
    return build_document(path, "html", text, metadata)
