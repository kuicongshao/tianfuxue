"use client";

import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchJson } from "@/components/corpus/api";

type NewsItem = {
  id: string;
  title: string;
  source: string;
  source_url: string;
  summary: string;
  category: string;
  region?: string;
  keywords: string[];
  related_entities: { name: string; entity_type: string }[];
  is_selected: boolean;
};

export function NewsItemList({ items, onChanged }: { items: NewsItem[]; onChanged: () => void }) {
  async function selectForCorpus(news_id: string) {
    await fetchJson("/api/news/select-for-corpus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ news_id })
    });
    onChanged();
  }

  return (
    <div className="glass rounded-lg p-5">
      <h2 className="text-lg font-semibold">新闻列表</h2>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-md border border-white/10 bg-white/[0.03] p-4">
            <div className="flex flex-col justify-between gap-3 md:flex-row">
              <div>
                <a href={item.source_url} target="_blank" rel="noreferrer" className="font-semibold hover:text-cyanline">
                  {item.title}
                </a>
                <div className="mt-2 text-xs text-slate-400">
                  {item.source} · {item.category} {item.region ? `· ${item.region}` : ""}
                </div>
              </div>
              <Button variant={item.is_selected ? "primary" : "outline"} onClick={() => selectForCorpus(item.id)} disabled={item.is_selected} className="shrink-0">
                <Archive className="h-4 w-4" />
                {item.is_selected ? "已入库" : "精选入库"}
              </Button>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">{item.summary}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {item.keywords.map((keyword) => (
                <span key={keyword} className="rounded-md border border-cyanline/20 bg-cyanline/10 px-2 py-1 text-xs text-cyanline">
                  {keyword}
                </span>
              ))}
            </div>
          </article>
        ))}
        {!items.length && <div className="rounded-md border border-white/10 p-8 text-center text-slate-500">暂无新闻</div>}
      </div>
    </div>
  );
}
