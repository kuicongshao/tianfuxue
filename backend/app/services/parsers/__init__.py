from pathlib import Path

from app.schemas.corpus import ParsedDocument
from app.services.parsers import csv_parser, docx_parser, html_parser, json_parser, markdown_parser, pdf_parser, txt_parser

PARSERS = {
    ".pdf": pdf_parser.parse,
    ".docx": docx_parser.parse,
    ".txt": txt_parser.parse,
    ".md": markdown_parser.parse,
    ".markdown": markdown_parser.parse,
    ".html": html_parser.parse,
    ".htm": html_parser.parse,
    ".json": json_parser.parse,
    ".csv": csv_parser.parse,
}


def parse_supported_file(path: Path) -> ParsedDocument:
    parser = PARSERS.get(path.suffix.lower())
    if not parser:
        raise ValueError(f"Unsupported file type: {path.suffix}")
    return parser(path)


def is_supported_file(path: Path) -> bool:
    if path.name.lower() == "readme.md":
        return False
    return path.is_file() and path.suffix.lower() in PARSERS
