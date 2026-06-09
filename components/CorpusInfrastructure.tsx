import { Archive, Bot, FileStack, GitFork, Globe2, Landmark, Map, RefreshCw, Search } from "lucide-react";

const repositories = [
  { name: "papers", label: "学术论文库", icon: FileStack },
  { name: "gazetteers", label: "地方志数据库", icon: Landmark },
  { name: "ancient_books", label: "巴蜀古籍数据库", icon: Archive },
  { name: "wechat_articles", label: "公众号文章库", icon: Globe2 },
  { name: "web_resources", label: "公开网页资料库", icon: Search },
  { name: "images", label: "图像资料库", icon: FileStack },
  { name: "maps", label: "地图与GIS资料库", icon: Map },
  { name: "multimedia", label: "多媒体资料库", icon: Archive }
];

const pipeline = ["发现", "入库", "解析", "清洗", "去重", "分块", "抽取", "向量化", "索引"];

export function CorpusInfrastructure() {
  return (
    <section id="corpus" className="relative z-10 px-5 py-16 md:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm uppercase tracking-[0.3em] text-cyanline">Digital Humanities Corpus</p>
        <h2 className="mt-3 text-3xl font-semibold md:text-5xl">天府学数字文献工程</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          统一承载论文、地方志、古籍、网页资源、公众号文章、图像、地图和多媒体，作为天府学智能体、知识图谱、研究舆图和 RAG 问答系统的知识底座。
        </p>

        <div className="mt-8 grid gap-3 md:grid-cols-4">
          {repositories.map((repo) => {
            const Icon = repo.icon;
            return (
              <div key={repo.name} className="glass rounded-lg p-4">
                <Icon className="h-5 w-5 text-cyanline" />
                <div className="mt-3 font-semibold">{repo.label}</div>
                <div className="mt-1 text-xs text-slate-400">/knowledge_base/{repo.name}</div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="glass rounded-lg p-5">
            <div className="mb-4 flex items-center gap-2 font-semibold">
              <RefreshCw className="h-5 w-5 text-jade" />
              自动入库流水线
            </div>
            <div className="grid gap-2 md:grid-cols-9">
              {pipeline.map((step) => (
                <div key={step} className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-3 text-center text-sm">
                  {step}
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-lg p-5">
            <div className="mb-4 flex items-center gap-2 font-semibold">
              <GitFork className="h-5 w-5 text-violetline" />
              知识服务
            </div>
            <div className="grid gap-2 text-sm">
              {["Tianfu Knowledge Graph", "PostgreSQL + pgvector", "BGE-M3 / bge-large-zh", "带引用来源的 RAG", "四川文化 GIS 数据库", "Update Agent"].map((item) => (
                <div key={item} className="rounded-md border border-violetline/20 bg-violetline/10 p-3">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-cyanline/20 bg-cyanline/5 p-4 text-sm text-slate-300">
          <Bot className="mr-2 inline h-4 w-4 text-cyanline" />
          所有资料条目保留 manifest、来源链接、页码、校验指纹、解析状态、实体关系证据和向量模型信息，保证后续智能体回答可审计、可回溯。
        </div>
      </div>
    </section>
  );
}
