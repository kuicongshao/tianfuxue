"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, Database, Newspaper, Tags } from "lucide-react";
import { fetchJson } from "@/components/corpus/api";
import { NewsCollectPanel } from "@/components/news/NewsCollectPanel";
import { NewsItemList } from "@/components/news/NewsItemList";
import { WeeklyReportPanel } from "@/components/news/WeeklyReportPanel";

export function NewsAgentDashboard() {
  const [items, setItems] = useState<any[]>([]);
  const [report, setReport] = useState<any | null>(null);
  const [category, setCategory] = useState("");
  const [keyword, setKeyword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const query = new URLSearchParams();
      if (category) query.set("category", category);
      if (keyword) query.set("keyword", keyword);
      const [news, weekly] = await Promise.all([
        fetchJson<{ items: any[] }>(`/api/news/items?${query.toString()}`),
        fetchJson<{ report: any | null }>("/api/news/weekly-report")
      ]);
      setItems(news.items);
      setReport(weekly.report);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "unknown error");
    }
  }, [category, keyword]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const stats = useMemo(
    () => [
      { label: "新闻条目", value: items.length, icon: Newspaper },
      { label: "分类数", value: new Set(items.map((item) => item.category)).size, icon: Tags },
      { label: "精选入库", value: items.filter((item) => item.is_selected).length, icon: Database },
      { label: "周报新闻", value: report?.news_count || 0, icon: BarChart3 }
    ],
    [items, report]
  );

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground md:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm uppercase tracking-[0.3em] text-cyanline">Sichuan Cultural Intelligence Center</p>
        <h1 className="mt-3 text-4xl font-semibold md:text-6xl">四川文化新闻周报智能体</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          持续追踪四川文化、天府文化、巴蜀文化、文化遗产、文旅发展和地方学研究动态。新闻默认不进入知识库，只有“精选入库”后才进入 Tianfu Knowledge Base。
        </p>

        {error && <div className="mt-5 rounded-md border border-amberdata/30 bg-amberdata/10 p-3 text-sm text-amberdata">API 暂不可用：{error}</div>}

        <div className="mt-8 grid gap-3 md:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="glass rounded-lg p-4">
                <Icon className="h-5 w-5 text-cyanline" />
                <div className="mt-3 text-3xl font-semibold">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[380px_1fr]">
          <div className="space-y-5">
            <NewsCollectPanel onDone={refresh} />
            <div className="glass rounded-lg p-5">
              <h2 className="text-lg font-semibold">筛选</h2>
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-4 h-10 w-full rounded-md border border-white/12 bg-slate-950/70 px-3 text-sm">
                <option value="">全部分类</option>
                {["文旅政策", "文化遗产", "非遗传承", "博物馆展览", "考古发现", "地方学研究", "城市文化", "数字文化", "国际传播", "其他"].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="关键词筛选" className="mt-3 h-10 w-full rounded-md border border-white/12 bg-slate-950/70 px-3 text-sm" />
            </div>
          </div>
          <WeeklyReportPanel report={report} onGenerated={refresh} />
        </div>

        <div className="mt-5">
          <NewsItemList items={items} onChanged={refresh} />
        </div>
      </div>
    </main>
  );
}
