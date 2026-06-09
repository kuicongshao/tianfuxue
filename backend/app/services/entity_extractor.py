from pathlib import Path
import re

from app.schemas.corpus import EntityType

DATA_DIR = Path(__file__).resolve().parents[1] / "data" / "entity_dictionaries"


def _load_lines(file_name: str) -> list[str]:
    path = DATA_DIR / file_name
    if not path.exists():
        return []
    return [line.strip() for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


DICTIONARIES: dict[str, list[str]] = {
    EntityType.place.value: _load_lines("places_sichuan.txt"),
    EntityType.dynasty.value: _load_lines("dynasties.txt"),
    EntityType.heritage.value: _load_lines("heritage_keywords.txt"),
    EntityType.method.value: _load_lines("methods.txt"),
    EntityType.theory.value: _load_lines("theories.txt"),
    EntityType.institution.value: _load_lines("institutions.txt"),
}

PERSON_PATTERNS = [
    r"李冰",
    r"诸葛亮",
    r"扬雄",
    r"司马相如",
    r"苏轼",
    r"杜甫",
    r"李白",
    r"([一-龥]{2,4})(?:先生|教授|研究员|学者)",
]

EVENT_PATTERNS = [
    r"[一-龥]{2,20}(?:事件|战役|运动|会议|考古发现|发掘)",
]

BOOK_PATTERNS = [
    r"《([^》]{2,40})》",
]

BUILDING_PATTERNS = [
    r"[一-龥]{2,20}(?:祠|庙|寺|院|楼|阁|馆|草堂|古城|古镇)",
]

INTANGIBLE_HINTS = ["川剧", "蜀锦", "蜀绣", "竹琴", "羌年", "火把节"]


def _context(text: str, start: int, end: int, radius: int = 36) -> str:
    return text[max(0, start - radius) : min(len(text), end + radius)]


def extract_entities_from_text(text: str) -> list[dict]:
    results: dict[tuple[str, str], dict] = {}

    for entity_type, words in DICTIONARIES.items():
        for word in words:
            for match in re.finditer(re.escape(word), text):
                actual_type = EntityType.intangible_heritage.value if word in INTANGIBLE_HINTS else entity_type
                results[(word, actual_type)] = {
                    "name": word,
                    "surface_text": word,
                    "entity_type": actual_type,
                    "start_offset": match.start(),
                    "end_offset": match.end(),
                    "confidence": 0.78,
                    "context": _context(text, match.start(), match.end()),
                }

    for pattern in PERSON_PATTERNS:
        for match in re.finditer(pattern, text):
            name = match.group(1) if match.groups() else match.group(0)
            results[(name, EntityType.person.value)] = {
                "name": name,
                "surface_text": name,
                "entity_type": EntityType.person.value,
                "start_offset": match.start(),
                "end_offset": match.end(),
                "confidence": 0.66,
                "context": _context(text, match.start(), match.end()),
            }

    for pattern, entity_type in [
        (EVENT_PATTERNS[0], EntityType.event.value),
        (BUILDING_PATTERNS[0], EntityType.building.value),
    ]:
        for match in re.finditer(pattern, text):
            name = match.group(0)
            results[(name, entity_type)] = {
                "name": name,
                "surface_text": name,
                "entity_type": entity_type,
                "start_offset": match.start(),
                "end_offset": match.end(),
                "confidence": 0.60,
                "context": _context(text, match.start(), match.end()),
            }

    for match in re.finditer(BOOK_PATTERNS[0], text):
        name = match.group(1)
        results[(name, EntityType.book.value)] = {
            "name": name,
            "surface_text": f"《{name}》",
            "entity_type": EntityType.book.value,
            "start_offset": match.start(),
            "end_offset": match.end(),
            "confidence": 0.72,
            "context": _context(text, match.start(), match.end()),
        }

    return list(results.values())
