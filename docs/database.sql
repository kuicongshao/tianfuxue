CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE corpus_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  layer TEXT NOT NULL CHECK (layer IN (
    'papers',
    'gazetteers',
    'ancient_books',
    'wechat_articles',
    'web_resources',
    'images',
    'maps',
    'multimedia'
  )),
  source_type TEXT NOT NULL,
  source_url TEXT,
  local_path TEXT,
  checksum TEXT UNIQUE,
  language TEXT DEFAULT 'zh',
  license TEXT,
  ingest_status TEXT NOT NULL DEFAULT 'raw',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX corpus_items_layer_idx ON corpus_items (layer);
CREATE INDEX corpus_items_status_idx ON corpus_items (ingest_status);
CREATE INDEX corpus_items_metadata_idx ON corpus_items USING gin (metadata);

CREATE TABLE papers (
  corpus_item_id UUID PRIMARY KEY REFERENCES corpus_items(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  authors TEXT[] DEFAULT '{}',
  published_year INT,
  journal TEXT,
  keywords TEXT[] DEFAULT '{}',
  abstract TEXT,
  doi TEXT,
  citation TEXT,
  pdf_path TEXT,
  citation_count INT DEFAULT 0
);

CREATE INDEX papers_year_idx ON papers (published_year);
CREATE INDEX papers_keywords_idx ON papers USING gin (keywords);
CREATE INDEX papers_search_idx ON papers USING gin (
  to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(abstract, '') || ' ' || array_to_string(keywords, ' '))
);

CREATE TABLE gazetteer_records (
  corpus_item_id UUID PRIMARY KEY REFERENCES corpus_items(id) ON DELETE CASCADE,
  gazetteer_name TEXT NOT NULL,
  region_name TEXT,
  dynasty TEXT,
  edition_year INT,
  volume TEXT,
  chapter TEXT,
  page_start INT,
  page_end INT
);

CREATE TABLE ancient_book_records (
  corpus_item_id UUID PRIMARY KEY REFERENCES corpus_items(id) ON DELETE CASCADE,
  book_name TEXT NOT NULL,
  dynasty TEXT,
  author TEXT,
  edition TEXT,
  chapter_tree JSONB NOT NULL DEFAULT '[]',
  ocr_confidence NUMERIC(4, 3)
);

CREATE TABLE web_resource_records (
  corpus_item_id UUID PRIMARY KEY REFERENCES corpus_items(id) ON DELETE CASCADE,
  site_name TEXT,
  domain TEXT,
  fetched_at TIMESTAMPTZ,
  canonical_url TEXT,
  summary TEXT
);

CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corpus_item_id UUID NOT NULL REFERENCES corpus_items(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL,
  text TEXT NOT NULL,
  content_tsv tsvector GENERATED ALWAYS AS (to_tsvector('simple', text)) STORED,
  page_number INT,
  section_title TEXT,
  token_count INT,
  embedding_model TEXT,
  embedding vector(1024),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (corpus_item_id, chunk_index)
);

CREATE INDEX document_chunks_item_idx ON document_chunks (corpus_item_id);
CREATE INDEX document_chunks_tsv_idx ON document_chunks USING gin (content_tsv);
CREATE INDEX document_chunks_embedding_idx
ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE TABLE chunk_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chunk_id UUID NOT NULL REFERENCES document_chunks(id) ON DELETE CASCADE,
  embedding vector(1024) NOT NULL,
  embedding_model TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (chunk_id, embedding_model)
);

CREATE INDEX chunk_embeddings_ivfflat_idx
ON chunk_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE TABLE knowledge_entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN (
    'Person',
    'Place',
    'Dynasty',
    'Event',
    'Book',
    'Paper',
    'Heritage',
    'IntangibleHeritage',
    'Building',
    'Institution',
    'Scholar',
    'Theory',
    'Method'
  )),
  aliases TEXT[] DEFAULT '{}',
  description TEXT,
  dynasty TEXT,
  start_year INT,
  end_year INT,
  latitude NUMERIC(9, 6),
  longitude NUMERIC(9, 6),
  confidence NUMERIC(4, 3) DEFAULT 0.500,
  properties JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX knowledge_entities_name_idx ON knowledge_entities (name);
CREATE INDEX knowledge_entities_type_idx ON knowledge_entities (entity_type);
CREATE INDEX knowledge_entities_aliases_idx ON knowledge_entities USING gin (aliases);
CREATE INDEX knowledge_entities_location_idx ON knowledge_entities (latitude, longitude);

CREATE TABLE entity_mentions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID REFERENCES knowledge_entities(id) ON DELETE SET NULL,
  corpus_item_id UUID NOT NULL REFERENCES corpus_items(id) ON DELETE CASCADE,
  chunk_id UUID REFERENCES document_chunks(id) ON DELETE CASCADE,
  surface_text TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  start_offset INT,
  end_offset INT,
  extractor TEXT NOT NULL,
  confidence NUMERIC(4, 3) DEFAULT 0.500,
  context TEXT
);

CREATE INDEX entity_mentions_item_idx ON entity_mentions (corpus_item_id);
CREATE INDEX entity_mentions_type_idx ON entity_mentions (entity_type);

CREATE TABLE knowledge_relations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_entity_id UUID NOT NULL REFERENCES knowledge_entities(id) ON DELETE CASCADE,
  target_entity_id UUID NOT NULL REFERENCES knowledge_entities(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL CHECK (relation_type IN (
    '位于',
    '属于',
    '创建于',
    '研究于',
    '引用',
    '影响',
    '传承',
    '关联',
    '传播',
    '发现于',
    '记载于',
    '保护于',
    'mentioned_in'
  )),
  evidence_corpus_item_id UUID REFERENCES corpus_items(id),
  evidence_chunk_id UUID REFERENCES document_chunks(id),
  confidence NUMERIC(4, 3) DEFAULT 0.500,
  properties JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX knowledge_relations_source_idx ON knowledge_relations (source_entity_id);
CREATE INDEX knowledge_relations_target_idx ON knowledge_relations (target_entity_id);
CREATE INDEX knowledge_relations_type_idx ON knowledge_relations (relation_type);

CREATE TABLE administrative_regions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  adcode TEXT,
  region_level TEXT NOT NULL,
  parent_id UUID REFERENCES administrative_regions(id),
  center_latitude NUMERIC(9, 6),
  center_longitude NUMERIC(9, 6),
  geojson_path TEXT,
  properties JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX administrative_regions_name_idx ON administrative_regions (name);
CREATE INDEX administrative_regions_adcode_idx ON administrative_regions (adcode);

CREATE TABLE region_cultural_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  region_id UUID NOT NULL REFERENCES administrative_regions(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES knowledge_entities(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL,
  source_corpus_item_id UUID REFERENCES corpus_items(id),
  properties JSONB NOT NULL DEFAULT '{}',
  UNIQUE (region_id, entity_id, asset_type)
);

CREATE TABLE rag_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  retrieval_strategy TEXT NOT NULL DEFAULT 'hybrid',
  citations JSONB NOT NULL DEFAULT '[]',
  confidence TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE analysis_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_type TEXT NOT NULL,
  title TEXT NOT NULL,
  parameters JSONB NOT NULL DEFAULT '{}',
  result JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE update_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_type TEXT NOT NULL,
  source_name TEXT,
  source_url TEXT,
  target_type TEXT,
  target_id UUID,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  schedule_cron TEXT,
  last_checked_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  result JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE research_frameworks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea TEXT NOT NULL,
  theory JSONB NOT NULL DEFAULT '[]',
  concepts JSONB NOT NULL DEFAULT '[]',
  questions JSONB NOT NULL DEFAULT '[]',
  variables JSONB NOT NULL DEFAULT '[]',
  methods JSONB NOT NULL DEFAULT '[]',
  data_sources JSONB NOT NULL DEFAULT '[]',
  mermaid TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE culture_news_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  source TEXT NOT NULL,
  source_url TEXT NOT NULL,
  published_at TIMESTAMPTZ,
  collected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  summary TEXT,
  keywords TEXT[] DEFAULT '{}',
  category TEXT NOT NULL DEFAULT '其他',
  region TEXT,
  related_entities JSONB NOT NULL DEFAULT '[]',
  checksum TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'collected',
  is_archived BOOLEAN NOT NULL DEFAULT false,
  is_selected BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX culture_news_items_category_idx ON culture_news_items (category);
CREATE INDEX culture_news_items_region_idx ON culture_news_items (region);
CREATE INDEX culture_news_items_published_idx ON culture_news_items (published_at);
CREATE INDEX culture_news_items_keywords_idx ON culture_news_items USING gin (keywords);
CREATE INDEX culture_news_items_selected_idx ON culture_news_items (is_selected);

CREATE TABLE weekly_news_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  main_topics JSONB NOT NULL DEFAULT '[]',
  news_count INT NOT NULL DEFAULT 0,
  report_markdown TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE atlas_regions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  latitude NUMERIC(9, 6) NOT NULL,
  longitude NUMERIC(9, 6) NOT NULL,
  administrative_level TEXT NOT NULL,
  area_km2 NUMERIC,
  population_million NUMERIC,
  cultural_intro TEXT,
  geojson_path TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE heritage_layer (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  era TEXT,
  latitude NUMERIC(9, 6) NOT NULL,
  longitude NUMERIC(9, 6) NOT NULL,
  intro TEXT,
  keywords TEXT[] DEFAULT '{}',
  related_literature JSONB NOT NULL DEFAULT '[]',
  region TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE intangible_heritage_layer (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  level TEXT,
  category TEXT,
  region TEXT,
  era TEXT,
  latitude NUMERIC(9, 6),
  longitude NUMERIC(9, 6),
  intro TEXT,
  keywords TEXT[] DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE museum_layer (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT,
  era TEXT,
  latitude NUMERIC(9, 6) NOT NULL,
  longitude NUMERIC(9, 6) NOT NULL,
  intro TEXT,
  keywords TEXT[] DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE historical_event_layer (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  place TEXT,
  era TEXT,
  latitude NUMERIC(9, 6),
  longitude NUMERIC(9, 6),
  intro TEXT,
  related_people TEXT[] DEFAULT '{}',
  related_literature JSONB NOT NULL DEFAULT '[]',
  keywords TEXT[] DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE research_layer (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  object_id TEXT NOT NULL,
  paper_count INT DEFAULT 0,
  topics TEXT[] DEFAULT '{}',
  scholars TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  trend TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX heritage_layer_region_idx ON heritage_layer (region);
CREATE INDEX heritage_layer_era_idx ON heritage_layer (era);
CREATE INDEX intangible_heritage_region_idx ON intangible_heritage_layer (region);
CREATE INDEX museum_layer_region_idx ON museum_layer (region);
CREATE INDEX historical_event_era_idx ON historical_event_layer (era);
CREATE INDEX research_layer_object_idx ON research_layer (object_id);

CREATE VIEW corpus_layer_stats AS
SELECT layer, count(*) AS item_count
FROM corpus_items
GROUP BY layer;

CREATE VIEW annual_paper_trends AS
SELECT published_year, count(*) AS paper_count
FROM papers
WHERE published_year IS NOT NULL
GROUP BY published_year
ORDER BY published_year;
