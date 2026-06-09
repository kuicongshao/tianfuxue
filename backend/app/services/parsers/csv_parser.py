from pathlib import Path

from app.schemas.corpus import ParsedDocument
from app.services.parsers.base import build_document


def parse(path: Path) -> ParsedDocument:
    import csv

    rows: list[str] = []
    with path.open("r", encoding="utf-8", errors="ignore", newline="") as file:
        reader = csv.DictReader(file)
        if reader.fieldnames:
            rows.append("字段: " + ", ".join(reader.fieldnames))
        for index, row in enumerate(reader):
            rows.append("；".join(f"{key}: {value}" for key, value in row.items()))
            if index >= 500:
                rows.append("... CSV preview truncated at 500 rows ...")
                break
    return build_document(path, "csv", "\n".join(rows), {"format": "csv"})
