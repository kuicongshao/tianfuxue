from enum import StrEnum
from typing import Any

try:
    from pydantic import BaseModel, Field
except ModuleNotFoundError:
    class _Field:
        def __init__(self, default: Any = None, default_factory: Any = None):
            self.default = default
            self.default_factory = default_factory

        def value(self) -> Any:
            if self.default_factory:
                return self.default_factory()
            return self.default

    def Field(default: Any = None, default_factory: Any = None) -> _Field:
        return _Field(default=default, default_factory=default_factory)

    class BaseModel:
        def __init__(self, **data: Any):
            annotations: dict[str, Any] = {}
            for cls in reversed(self.__class__.mro()):
                annotations.update(getattr(cls, "__annotations__", {}))
            for key in annotations:
                if key in data:
                    value = data[key]
                else:
                    default = getattr(self.__class__, key, None)
                    value = default.value() if isinstance(default, _Field) else default
                setattr(self, key, value)

        def model_dump(self) -> dict[str, Any]:
            return dict(self.__dict__)


class CorpusLayer(StrEnum):
    papers = "papers"
    gazetteers = "gazetteers"
    ancient_books = "ancient_books"
    wechat_articles = "wechat_articles"
    web_resources = "web_resources"
    images = "images"
    maps = "maps"
    multimedia = "multimedia"


class SourceType(StrEnum):
    pdf = "pdf"
    docx = "docx"
    txt = "txt"
    markdown = "markdown"
    html = "html"
    json = "json"
    csv = "csv"
    web_article = "web_article"
    wechat_article = "wechat_article"
    gazetteer = "gazetteer"
    ancient_book = "ancient_book"
    image = "image"
    map = "map"
    audio = "audio"
    video = "video"


class IngestStatus(StrEnum):
    raw = "raw"
    parsed = "parsed"
    cleaned = "cleaned"
    duplicate = "duplicate"
    chunked = "chunked"
    embedded = "embedded"
    indexed = "indexed"
    failed = "failed"


class CorpusManifest(BaseModel):
    title: str
    layer: CorpusLayer
    source_type: SourceType
    authors: list[str] = Field(default_factory=list)
    year: int | None = None
    journal: str | None = None
    keywords: list[str] = Field(default_factory=list)
    abstract: str | None = None
    doi: str | None = None
    citation: str | None = None
    source_url: str | None = None
    local_path: str | None = None
    pdf_path: str | None = None
    ocr_path: str | None = None
    embedding_model: str | None = None
    ingest_status: IngestStatus = IngestStatus.raw
    checksum: str | None = None
    license: str | None = None
    confidence: float | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class ParsedDocument(BaseModel):
    source_path: str
    file_name: str
    file_type: str
    title: str
    authors: list[str] = Field(default_factory=list)
    year: int | None = None
    abstract: str | None = None
    keywords: list[str] = Field(default_factory=list)
    raw_text: str
    clean_text: str
    metadata: dict[str, Any] = Field(default_factory=dict)
    checksum: str


class CorpusItem(BaseModel):
    id: str
    title: str
    layer: str
    source_type: str
    source_path: str
    checksum: str
    ingest_status: str
    duplicate_of: str | None = None
    authors: list[str] = Field(default_factory=list)
    year: int | None = None
    abstract: str | None = None
    keywords: list[str] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: str


class DocumentChunk(BaseModel):
    id: str
    corpus_item_id: str
    chunk_index: int
    text: str
    token_count: int
    metadata: dict[str, Any] = Field(default_factory=dict)


class ExtractedEntity(BaseModel):
    id: str
    name: str
    entity_type: str
    confidence: float = 0.7
    metadata: dict[str, Any] = Field(default_factory=dict)


class EntityMention(BaseModel):
    id: str
    entity_id: str
    corpus_item_id: str
    chunk_id: str
    surface_text: str
    entity_type: str
    confidence: float = 0.7
    context: str | None = None


class KnowledgeRelation(BaseModel):
    id: str
    source_entity_id: str
    target_entity_id: str
    relation_type: str
    evidence_corpus_item_id: str | None = None
    evidence_chunk_id: str | None = None
    confidence: float = 0.55


class IngestionJob(BaseModel):
    id: str
    job_type: str
    status: str
    target_type: str | None = None
    target_id: str | None = None
    source_path: str | None = None
    result: dict[str, Any] = Field(default_factory=dict)
    created_at: str


class EntityType(StrEnum):
    person = "Person"
    place = "Place"
    dynasty = "Dynasty"
    event = "Event"
    book = "Book"
    paper = "Paper"
    heritage = "Heritage"
    intangible_heritage = "IntangibleHeritage"
    building = "Building"
    institution = "Institution"
    scholar = "Scholar"
    theory = "Theory"
    method = "Method"


class RelationType(StrEnum):
    located_in = "位于"
    belongs_to = "属于"
    created_in = "创建于"
    researched_by = "研究于"
    cites = "引用"
    influences = "影响"
    inherits = "传承"
    related_to = "关联"
    spreads = "传播"
    discovered_at = "发现于"
    recorded_in = "记载于"
    protected_by = "保护于"
    mentioned_in = "mentioned_in"
