# Tianfu Studies AI Platform

## 项目介绍

天府学研究中心智能研究平台是面向天府学、地方学、历史学、新闻传播学、文化遗产与数字人文研究的智能研究基础设施。当前 MVP 已打通：

- Tianfu Digital Humanities Corpus 文献导入
- 规则实体抽取与初步知识图谱
- 本地 embedding job
- keyword / vector / hybrid 检索
- RAG fallback 问答
- Weekly Sichuan Culture News Agent 四川文化新闻周报智能体
- Tianfu Cultural Atlas 天府文化 GIS 研究舆图
- Next.js 前端页面
- FastAPI 后端
- PostgreSQL + pgvector 数据库设计
- Docker Compose 私有化部署

## 技术架构

- Frontend: Next.js 15, TypeScript, TailwindCSS, Framer Motion
- Backend: FastAPI
- Corpus: local `knowledge_base` + future PostgreSQL persistence
- Vector DB: PostgreSQL + pgvector
- Embedding: local `BAAI/bge-m3` by default, deterministic fallback when model dependency is unavailable
- LLM: fallback by default; external API only when `ENABLE_PAID_API=true` and `OPENAI_API_KEY` or `DEEPSEEK_API_KEY` is explicitly configured
- GIS: Leaflet + Sichuan GeoJSON

## 本地运行

安装依赖：

```bash
npm install
pip install -r backend/requirements.txt
```

部署前验证：

```bash
npm run build
python -m compileall -q backend/app
```

```bash
npm install
npm run dev
```

后端：

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

访问：

- 首页：`http://localhost:3000`
- 文献工程：`http://localhost:3000/corpus`
- 研究助手：`http://localhost:3000/research-assistant`
- 新闻智能体：`http://localhost:3000/news-agent`
- 天府文化研究舆图：`http://localhost:3000/atlas`
- API 文档：`http://localhost:8000/docs`

## 环境变量

复制 `.env.example`：

```bash
cp .env.example .env
```

关键变量：

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
DATABASE_URL=postgresql+psycopg://tianfu:tianfu@localhost:5432/tianfu
DATABASE_MODE=json
EMBEDDING_PROVIDER=local
EMBEDDING_MODEL=BAAI/bge-m3
LLM_PROVIDER=fallback
OPENAI_API_KEY=
DEEPSEEK_API_KEY=
NEWS_CACHE_WEEKS=12
ENABLE_PAID_API=false
UPLOAD_MAX_MB=25
```

默认不调用付费 API。`ENABLE_PAID_API=false` 时，即使配置了 API KEY 也不会调用外部付费模型。

`DATABASE_MODE=json` 使用本地 JSON store，适合演示和开发。`DATABASE_MODE=postgres` 的 PostgreSQL + pgvector schema 已准备在 `docs/database.sql`，后续可接入 repository adapter。

## 文献导入

支持：

- PDF
- DOCX
- TXT
- MD
- HTML
- JSON
- CSV

导入 `knowledge_base/imports`：

```bash
python -c "import sys; sys.path.insert(0, 'backend'); from app.services.ingestion_service import import_directory; print(import_directory())"
```

API：

- `POST /api/ingestion/import-file`
- `POST /api/ingestion/import-directory`
- `GET /api/ingestion/jobs`
- `GET /api/corpus/items`
- `GET /api/corpus/items/{id}`

## Embedding 生成

导入文献会自动创建 `job_type=embedding` 的 pending jobs。

运行 embedding jobs：

```bash
python -c "import sys; sys.path.insert(0, 'backend'); from app.services.job_runner import run_embedding_jobs; print(run_embedding_jobs())"
```

API：

- `POST /api/update-agent/run-embedding-jobs`
- `GET /api/update-agent/jobs`

## 检索

API：

```http
POST /api/search
```

参数：

```json
{
  "query": "都江堰 李冰",
  "top_k": 5,
  "search_type": "hybrid"
}
```

`search_type` 支持：

- `keyword`
- `vector`
- `hybrid`

## RAG 问答

API：

```http
POST /api/rag/ask
```

参数：

```json
{
  "question": "都江堰和李冰有什么关系？",
  "top_k": 5,
  "search_type": "hybrid"
}
```

返回：

- `answer`
- `citations`
- `retrieved_chunks`
- `confidence`
- `llm_provider`

如果知识库没有依据，系统返回“当前知识库中未检索到可靠依据”。无 API KEY 时使用 fallback 检索摘要模式。

## 四川文化新闻周报智能体

新闻系统是动态文化情报流，不是 Tianfu Knowledge Base 主体。默认仅保存标题、摘要、来源、链接、分类、关键词和实体信息，不保存全文、raw HTML 或完整网页。

页面：

```text
http://localhost:3000/news-agent
```

API：

- `POST /api/news/collect`：按关键词或 RSS 采集公开新闻
- `POST /api/news/collect-url`：手动输入公开新闻链接
- `GET /api/news/items`：查看新闻列表，支持分类和关键词筛选
- `GET /api/news/weekly-report`：查看最新周报
- `POST /api/news/generate-weekly-report`：生成《四川文化新闻周报》
- `POST /api/news/select-for-corpus`：人工精选后进入知识库

策略：

- 默认不进入知识库。
- 默认不生成 embedding。
- 最近 12 周新闻轻量缓存。
- `is_selected=true` 或 `is_archived=true` 的新闻永久保留。
- 无 API KEY 时使用规则摘要、关键词抽取、实体识别和主题统计。
- 有 API KEY 时才允许未来接入外部 LLM 优化摘要。

## 天府文化 GIS 研究舆图

页面：

```text
http://localhost:3000/atlas
```

能力：

- 四川省真实经纬度地图展示
- 21 个市州行政区基础数据库
- 文化遗产图层
- 非遗图层
- 博物馆图层
- 历史事件图层
- 时间轴筛选
- vis-network 知识图谱联动
- 文献、新闻与研究热点联动

API：

- `GET /api/map/regions`
- `GET /api/map/heritage`
- `GET /api/map/intangible-heritage`
- `GET /api/map/museums`
- `GET /api/map/events`
- `GET /api/map/research`
- `GET /api/map/object/{id}`

## Docker Compose

```bash
docker compose up --build
```

服务：

- frontend: `3000`
- backend: `8000`
- postgres + pgvector: `5432`

## GitHub 上传

```bash
git init
git add .
git commit -m "Initial Tianfu Studies AI Platform MVP"
git branch -M main
git remote add origin https://github.com/<your-org>/<your-repo>.git
git push -u origin main
```

不要提交 `.env`、私有 API KEY、受版权限制的原始文献。

## Vercel / Cloudflare Pages

前端可部署到 Vercel 或 Cloudflare Pages。

构建配置：

- Build command: `npm run build`
- Output: Next.js default
- Environment: `NEXT_PUBLIC_API_BASE_URL=https://your-backend.example.com`

## 后端部署

后端可部署到 Railway、Render、Fly.io 或 Docker VPS。

建议：

- 使用 Dockerfile: `backend/Dockerfile`
- 设置 `DATABASE_URL`
- 默认 `LLM_PROVIDER=fallback`
- 默认 `EMBEDDING_PROVIDER=local`

如果服务器资源有限，可以先使用 deterministic fallback embedding；生产环境再预下载 BGE-M3 模型。

## 数据库部署

推荐：

- Supabase PostgreSQL + pgvector
- Railway PostgreSQL + pgvector
- 自建 PostgreSQL + pgvector

初始化 SQL：

```bash
psql "$DATABASE_URL" -f docs/database.sql
```

## 路线图

- 将当前 local corpus store 切换为 PostgreSQL 持久化
- 接入 BGE-M3 批量向量化与增量索引
- 接入 OpenAI / DeepSeek LLM adapter
- 完整四川行政区划 GIS 数据
- 文献计量、共词、共引、主题模型分析
