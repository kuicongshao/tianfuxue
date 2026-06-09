"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Database, FileText, GitFork, Network } from "lucide-react";
import { CorpusItemList } from "@/components/corpus/CorpusItemList";
import { EntityBrowser } from "@/components/corpus/EntityBrowser";
import { FileUploadPanel } from "@/components/corpus/FileUploadPanel";
import { IngestionJobTable } from "@/components/corpus/IngestionJobTable";
import { fetchJson } from "@/components/corpus/api";

type DashboardState = {
  items: any[];
  jobs: any[];
  entities: any[];
  relations: any[];
  error?: string;
};

export function CorpusDashboard() {
  const [state, setState] = useState<DashboardState>({ items: [], jobs: [], entities: [], relations: [] });
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [items, jobs, entities, relations] = await Promise.all([
        fetchJson<{ items: any[] }>("/api/corpus/items"),
        fetchJson<{ items: any[] }>("/api/ingestion/jobs"),
        fetchJson<{ items: any[] }>("/api/graph/entities"),
        fetchJson<{ items: any[] }>("/api/graph/relations"),
      ]);
      setState({ items: items.items, jobs: jobs.items, entities: entities.items, relations: relations.items });
    } catch (error) {
      setState((current) => ({ ...current, error: error instanceof Error ? error.message : "unknown error" }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const stats = useMemo(
    () => [
      { label: "文献条目", value: state.items.length, icon: FileText },
      { label: "Chunks", value: state.items.reduce((sum, item) => sum + (item.chunk_count || 0), 0), icon: Database },
      { label: "实体", value: state.entities.length, icon: Network },
      { label: "关系", value: state.relations.length, icon: GitFork },
    ],
    [state]
  );

  return (
    <div className="min-h-screen bg-background px-5 py-8 text-foreground md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyanline">Tianfu Corpus Ingestion</p>
            <h1 className="mt-3 text-4xl font-semibold md:text-6xl">天府学数字文献工程</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              上传文件或导入 `knowledge_base/imports`，自动完成解析、去重、切分、实体抽取、初步关系生成与 embedding pending job 创建。
            </p>
          </div>
          <button onClick={refresh} className="h-10 rounded-md border border-white/15 px-4 text-sm hover:bg-white/10">
            {loading ? "刷新中..." : "刷新"}
          </button>
        </div>

        {state.error && <div className="mt-5 rounded-md border border-amberdata/30 bg-amberdata/10 p-3 text-sm text-amberdata">API 暂不可用：{state.error}</div>}

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

        <div className="mt-5 grid gap-5 lg:grid-cols-[360px_1fr]">
          <FileUploadPanel onImported={refresh} />
          <IngestionJobTable jobs={state.jobs} />
        </div>

        <div className="mt-5">
          <CorpusItemList items={state.items} />
        </div>

        <div className="mt-5">
          <EntityBrowser entities={state.entities} relations={state.relations} />
        </div>
      </div>
    </div>
  );
}
