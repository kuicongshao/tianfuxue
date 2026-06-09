from pathlib import Path

from app.schemas.corpus import ParsedDocument


def checksum_file(path: Path) -> str:
    import hashlib

    digest = hashlib.sha256()
    with path.open("rb") as file:
        for block in iter(lambda: file.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def detect_year(text: str) -> int | None:
    import re

    match = re.search(r"(19|20)\d{2}", text)
    return int(match.group(0)) if match else None


def clean_text(text: str) -> str:
    import re

    normalized = text.replace("\r\n", "\n").replace("\r", "\n")
    normalized = re.sub(r"[ \t]+", " ", normalized)
    normalized = re.sub(r"\n{3,}", "\n\n", normalized)
    return normalized.strip()


def infer_title(path: Path, text: str) -> str:
    for line in text.splitlines():
        stripped = line.strip().strip("#").strip()
        if stripped:
            return stripped[:120]
    return path.stem


def parse_keywords(text: str) -> list[str]:
    import re

    match = re.search(r"(关键词|关键字|Keywords?)[:：]\s*(.+)", text, re.IGNORECASE)
    if not match:
        return []
    return [item.strip() for item in re.split(r"[;,，、]", match.group(2)) if item.strip()][:12]


def parse_authors(text: str) -> list[str]:
    import re

    match = re.search(r"(作者|Author)[:：]\s*(.+)", text, re.IGNORECASE)
    if not match:
        return []
    return [item.strip() for item in re.split(r"[;,，、]", match.group(2)) if item.strip()][:12]


def parse_abstract(text: str) -> str | None:
    import re

    match = re.search(r"(摘要|Abstract)[:：]\s*(.{20,600})", text, re.IGNORECASE | re.DOTALL)
    if not match:
        return None
    return clean_text(match.group(2))[:800]


def build_document(path: Path, file_type: str, raw_text: str, metadata: dict | None = None) -> ParsedDocument:
    cleaned = clean_text(raw_text)
    return ParsedDocument(
        source_path=str(path),
        file_name=path.name,
        file_type=file_type,
        title=infer_title(path, cleaned),
        authors=parse_authors(cleaned),
        year=detect_year(cleaned),
        abstract=parse_abstract(cleaned),
        keywords=parse_keywords(cleaned),
        raw_text=raw_text,
        clean_text=cleaned,
        metadata=metadata or {},
        checksum=checksum_file(path),
    )
