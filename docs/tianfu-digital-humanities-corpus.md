# Tianfu Digital Humanities Corpus

天府学数字文献工程是 Tianfu Studies AI Platform 的统一知识底座，服务于天府学智能体、研究助手、知识图谱、研究舆图和 RAG 问答系统。

## 目录架构

```text
knowledge_base/
  papers/
  gazetteers/
  ancient_books/
  wechat_articles/
  web_resources/
  images/
  maps/
  multimedia/
  imports/
  processed/
  exports/
```

每个资料条目使用 `knowledge_base/manifest.schema.json` 描述元数据、来源、版权、解析状态、校验指纹和向量模型。

## 五层知识体系

### Layer 1: Papers

覆盖天府学、巴蜀文化、蜀学、四川历史、成都研究、地方学、城市文化、文化遗产、数字人文、地方传播、地方认同、文化地理、国际地方学。

核心字段：

- title
- author
- year
- journal
- keywords
- abstract
- doi
- citation
- pdf_path
- embedding

### Layer 2: Gazetteers

重点建设四川省志、成都府志、华阳国志、四川通志和市州地方志。解析目标包括地名、人物、事件、时间、文化对象和实体关系网络。

### Layer 3: Ancient Books

覆盖蜀中广记、全蜀艺文志、蜀碧、蜀鉴、蜀学文献、巴蜀历史文献。处理流程包括 OCR、章节结构识别、人物抽取、地点抽取、事件抽取和知识图谱构建。

### Layer 4: Web Resources

采集高校研究中心、地方文化网站、博物馆网站、非遗网站、政府公开文化资源、数字图书馆和文化遗产数据库。流程包括自动抓取、清洗、去重、摘要和向量化。

### Layer 5: Tianfu Special Collections

面向公众号文章、网页、PDF、Word、Markdown 和用户上传资料，支持批量导入、增量更新和重复检测。

## 知识图谱本体

实体类型：

- Person
- Place
- Dynasty
- Event
- Book
- Paper
- Heritage
- IntangibleHeritage
- Building
- Institution
- Scholar
- Theory
- Method

关系类型：

- 位于
- 属于
- 创建于
- 研究于
- 引用
- 影响
- 传承
- 关联
- 传播
- 发现于
- 记载于
- 保护于

## 入库流水线

```mermaid
flowchart LR
  A[资源发现] --> B[原始入库]
  B --> C[格式解析]
  C --> D[文本清洗]
  D --> E[重复检测]
  E --> F[语义分块]
  F --> G[实体关系抽取]
  G --> H[Embedding]
  H --> I[混合索引]
  I --> J[RAG/图谱/舆图/分析]
```

## 向量与混合检索

默认方案：

- Embedding: BGE-M3
- 备选: bge-large-zh
- Vector DB: PostgreSQL + pgvector
- Keyword Search: PostgreSQL full text search
- Hybrid Retrieval: keyword score + cosine similarity + metadata filters

百万级文献建议：

- 分层存储原文、清洗文本、chunk 和 embedding。
- `document_chunks` 使用 `ivfflat` 或未来升级为 `hnsw` 索引。
- 按 `layer`、`year`、`entity_type`、`region` 做过滤。
- 保留 `page_number`、`section_title` 和 `source_url`，确保 RAG 可溯源。

## RAG 回答约束

回答必须返回：

- 引用文献
- 出处
- 页码
- 来源链接
- 知识来源置信度

低置信度策略：

- 如果检索结果不足，返回“证据不足”，不扩展生成。
- 每条答案保存 `rag_answers`，便于审计与追溯。

## 文献分析系统

自动生成：

- 关键词统计
- 作者统计
- 机构统计
- 年度发文趋势
- 研究热点分析
- 主题模型分析
- 共词分析
- 共引分析
- 知识演化分析

## 数字人文分析系统

支持：

- 知识图谱分析
- GIS 空间分析
- 时间轴分析
- 文化传播路径分析
- 地方学研究谱系分析

## 四川文化 GIS 数据库

覆盖成都、德阳、绵阳、乐山、眉山、雅安、广元、宜宾、泸州、南充、达州、攀枝花、阿坝州、甘孜州、凉山州、自贡、遂宁、内江、广安、巴中、资阳等全部行政区域。

每个区域关联：

- 文化遗产
- 古建筑
- 非遗
- 历史人物
- 历史事件
- 研究文献
- 关联关系

## Update Agent

定期检测：

- 新增论文
- 新增地方志
- 新增研究成果
- 新增公开文化资源
- 新增用户上传内容

自动执行：

- 入库
- 解析
- 去重
- 向量化
- 更新知识图谱

## API

- `GET /api/corpus/layers`
- `GET /api/corpus/pipeline`
- `POST /api/corpus/manifest/validate`
- `GET /api/corpus/stats`
- `POST /api/ingestion/jobs`
- `POST /api/ingestion/import-file`
- `POST /api/ingestion/import-directory`
- `GET /api/ingestion/jobs`
- `GET /api/ingestion/deduplication/policy`
- `GET /api/corpus/items`
- `GET /api/corpus/items/{item_id}`
- `GET /api/graph/ontology`
- `POST /api/graph/extract`
- `GET /api/graph/entities`
- `GET /api/graph/relations`
- `GET /api/graph/neighborhood/{entity_name}`
- `GET /api/analytics/literature`
- `GET /api/analytics/digital-humanities`
- `GET /api/analytics/gis/sichuan`
- `GET /api/update-agent/policy`
- `POST /api/update-agent/sources`
- `GET /api/update-agent/jobs`
- `POST /api/update-agent/run-embedding-jobs`
- `POST /api/search`
- `POST /api/rag/ask`

## 第三阶段：Embedding + Retrieval + RAG

默认策略：

- `EMBEDDING_PROVIDER=local`
- `EMBEDDING_MODEL=BAAI/bge-m3`
- `LLM_PROVIDER=fallback`

系统优先尝试通过 `sentence-transformers` 加载本地 BGE-M3。若部署环境尚未下载模型或依赖不可用，自动使用 deterministic local embedding 兜底，保证 MVP 不调用外部付费 API。

Embedding jobs：

```bash
python -c "import sys; sys.path.insert(0, 'backend'); from app.services.job_runner import run_embedding_jobs; print(run_embedding_jobs())"
```

检索模式：

- keyword search
- vector search
- hybrid search

RAG 约束：

- 回答必须返回引用来源。
- 不得编造知识库之外的事实。
- 没有可靠依据时返回“当前知识库中未检索到可靠依据”。
- 没有 API KEY 时使用 fallback 检索摘要模式。

## 四川文化新闻周报智能体

Weekly Sichuan Culture News Agent 定位为四川文化情报中心，是动态文化情报流，不是知识库主体。

采集范围：

- 四川文化
- 天府文化
- 巴蜀文化
- 文化遗产
- 非遗保护
- 考古发现
- 博物馆活动
- 文旅发展
- 地方学研究
- 数字文化建设

存储策略：

- 默认不保存全文。
- 默认不保存 raw HTML。
- 默认不保存完整网页。
- 仅保存标题、摘要、来源、链接、分类、关键词、地区和实体信息。
- 最近 12 周轻量缓存。
- `is_selected=true` 或 `is_archived=true` 永久保留。

API：

- `POST /api/news/collect`
- `POST /api/news/collect-url`
- `GET /api/news/items`
- `GET /api/news/weekly-report`
- `POST /api/news/generate-weekly-report`
- `POST /api/news/select-for-corpus`

精选入库：

新闻默认不进入 Tianfu Knowledge Base。只有用户点击“精选入库”后，系统才创建 corpus item、document chunks、entities、relations 和 embedding jobs。

## Tianfu Cultural Atlas

天府文化 GIS 研究舆图用于联动地图、时间轴、知识图谱和文献库，形成空间、时间、知识、研究成果四维融合的数字人文展示模块。

MVP 已包含：

- 四川省地图与 GeoJSON 边界
- 21 个市州基础数据
- 文化遗产图层
- 非遗图层
- 博物馆图层
- 历史事件图层
- 时间轴筛选
- vis-network 知识图谱
- 关联文献与新闻线索

API：

- `GET /api/map/regions`
- `GET /api/map/heritage`
- `GET /api/map/intangible-heritage`
- `GET /api/map/museums`
- `GET /api/map/events`
- `GET /api/map/research`
- `GET /api/map/object/{id}`

前端页面：

- `/atlas`
