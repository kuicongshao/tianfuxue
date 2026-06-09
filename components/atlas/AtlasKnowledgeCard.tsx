"use client";

import { BookOpen, Network, TrendingUp } from "lucide-react";
import type { AtlasObject } from "@/components/atlas/types";
import { AtlasKnowledgeGraph } from "@/components/atlas/AtlasKnowledgeGraph";

export function AtlasKnowledgeCard({ object }: { object?: AtlasObject | null }) {
  if (!object) {
    return (
      <aside className="glass rounded-lg p-5">
        <h2 className="text-lg font-semibold">知识卡片</h2>
        <p className="mt-4 text-sm leading-6 text-slate-400">点击地图上的文化对象，查看简介、关键词、研究趋势、知识图谱和文献联动。</p>
      </aside>
    );
  }

  return (
    <aside className="glass max-h-[calc(100vh-160px)] overflow-auto rounded-lg p-5">
      <div className="text-xs uppercase tracking-[0.24em] text-cyanline">{object.layer}</div>
      <h2 className="mt-2 text-2xl font-semibold">{object.name}</h2>
      <div className="mt-2 text-sm text-slate-400">
        {object.category || object.level || "文化对象"} {object.era ? `· ${object.era}` : ""} {object.region ? `· ${object.region}` : ""}
      </div>
      <p className="mt-4 text-sm leading-7 text-slate-300">{object.intro}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {object.keywords?.map((keyword) => (
          <span key={keyword} className="rounded-md border border-cyanline/20 bg-cyanline/10 px-2 py-1 text-xs text-cyanline">
            {keyword}
          </span>
        ))}
      </div>

      <section className="mt-6">
        <h3 className="mb-3 flex items-center gap-2 font-semibold">
          <Network className="h-4 w-4 text-violetline" />
          知识图谱联动
        </h3>
        <AtlasKnowledgeGraph object={object} />
      </section>

      <section className="mt-6">
        <h3 className="mb-3 flex items-center gap-2 font-semibold">
          <TrendingUp className="h-4 w-4 text-jade" />
          学术研究图层
        </h3>
        {object.research ? (
          <div className="rounded-md border border-white/10 bg-white/[0.03] p-3 text-sm leading-6 text-slate-300">
            <div>相关论文数量：{object.research.paper_count}</div>
            <div>研究主题：{object.research.topics.join("、")}</div>
            <div>相关学者：{object.research.scholars.join("、")}</div>
            <div>研究趋势：{object.research.trend}</div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">暂无研究统计。</p>
        )}
      </section>

      <section className="mt-6">
        <h3 className="mb-3 flex items-center gap-2 font-semibold">
          <BookOpen className="h-4 w-4 text-amberdata" />
          文献与新闻联动
        </h3>
        <div className="space-y-2 text-sm">
          {object.literature?.papers?.map((paper) => (
            <div key={paper.id} className="rounded-md border border-white/10 bg-white/[0.03] p-2 text-slate-300">
              {paper.title}
            </div>
          ))}
          {object.literature?.news?.map((news) => (
            <a key={news.source_url} href={news.source_url} target="_blank" rel="noreferrer" className="block rounded-md border border-white/10 bg-white/[0.03] p-2 text-slate-300 hover:text-cyanline">
              {news.title}
            </a>
          ))}
          {!(object.literature?.papers?.length || object.literature?.news?.length) && <div className="text-slate-500">暂无关联文献或新闻。</div>}
        </div>
      </section>
    </aside>
  );
}
