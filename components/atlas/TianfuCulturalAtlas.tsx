"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchJson } from "@/components/corpus/api";
import { AtlasFilterPanel } from "@/components/atlas/AtlasFilterPanel";
import { AtlasKnowledgeCard } from "@/components/atlas/AtlasKnowledgeCard";
import { AtlasMap } from "@/components/atlas/AtlasMap";
import { AtlasTimeline } from "@/components/atlas/AtlasTimeline";
import type { AtlasLayer, AtlasObject, Region } from "@/components/atlas/types";

export function TianfuCulturalAtlas() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [objects, setObjects] = useState<AtlasObject[]>([]);
  const [selected, setSelected] = useState<AtlasObject | null>(null);
  const [activeLayers, setActiveLayers] = useState<AtlasLayer[]>(["heritage"]);
  const [activeEra, setActiveEra] = useState("全部");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [regionRes, heritage, intangible, museums, events] = await Promise.all([
        fetchJson<{ items: Region[] }>("/api/map/regions"),
        fetchJson<{ items: AtlasObject[] }>(`/api/map/heritage?era=${encodeURIComponent(activeEra)}`),
        fetchJson<{ items: AtlasObject[] }>(`/api/map/intangible-heritage?era=${encodeURIComponent(activeEra)}`),
        fetchJson<{ items: AtlasObject[] }>(`/api/map/museums?era=${encodeURIComponent(activeEra)}`),
        fetchJson<{ items: AtlasObject[] }>(`/api/map/events?era=${encodeURIComponent(activeEra)}`)
      ]);
      setRegions(regionRes.items);
      setObjects([...heritage.items, ...intangible.items, ...museums.items, ...events.items]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "unknown error");
    }
  }, [activeEra]);

  useEffect(() => {
    load();
  }, [load]);

  async function selectObject(id: string) {
    try {
      const detail = await fetchJson<{ item: AtlasObject }>(`/api/map/object/${id}`);
      setSelected(detail.item);
    } catch (err) {
      setError(err instanceof Error ? err.message : "unknown error");
    }
  }

  const visibleObjects = useMemo(
    () => objects.filter((item) => activeLayers.includes(item.layer) && (!selectedRegion || item.region === selectedRegion)),
    [objects, activeLayers, selectedRegion]
  );

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground md:px-10">
      <div className="mx-auto max-w-[1600px]">
        <p className="text-sm uppercase tracking-[0.3em] text-cyanline">Tianfu Cultural Atlas</p>
        <h1 className="mt-3 text-4xl font-semibold md:text-6xl">天府文化GIS研究舆图</h1>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-300">
          以四川真实地理空间为底座，联动时间轴、知识图谱、文献库与研究成果，实现空间、时间、知识、研究四维融合。
        </p>
        {error && <div className="mt-5 rounded-md border border-amberdata/30 bg-amberdata/10 p-3 text-sm text-amberdata">API 暂不可用：{error}</div>}

        <div className="mt-8 grid gap-5 xl:grid-cols-[280px_1fr_420px]">
          <AtlasFilterPanel activeLayers={activeLayers} setActiveLayers={setActiveLayers} regions={regions} selectedRegion={selectedRegion} setSelectedRegion={setSelectedRegion} />
          <AtlasMap objects={visibleObjects} regions={regions} onSelect={selectObject} />
          <AtlasKnowledgeCard object={selected} />
        </div>

        <div className="mt-5">
          <AtlasTimeline activeEra={activeEra} setActiveEra={setActiveEra} />
        </div>
      </div>
    </main>
  );
}
