"use client";

import { Layers } from "lucide-react";
import type { AtlasLayer, Region } from "@/components/atlas/types";

const layerOptions: { key: AtlasLayer; label: string }[] = [
  { key: "heritage", label: "文化遗产" },
  { key: "intangible", label: "非遗" },
  { key: "museum", label: "博物馆" },
  { key: "event", label: "历史事件" }
];

export function AtlasFilterPanel({
  activeLayers,
  setActiveLayers,
  regions,
  selectedRegion,
  setSelectedRegion
}: {
  activeLayers: AtlasLayer[];
  setActiveLayers: (layers: AtlasLayer[]) => void;
  regions: Region[];
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
}) {
  function toggleLayer(layer: AtlasLayer) {
    setActiveLayers(activeLayers.includes(layer) ? activeLayers.filter((item) => item !== layer) : [...activeLayers, layer]);
  }

  return (
    <aside className="glass rounded-lg p-4">
      <div className="mb-4 flex items-center gap-2 font-semibold">
        <Layers className="h-5 w-5 text-cyanline" />
        筛选面板
      </div>
      <div className="space-y-2">
        {layerOptions.map((layer) => (
          <label key={layer.key} className="flex cursor-pointer items-center justify-between rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">
            {layer.label}
            <input type="checkbox" checked={activeLayers.includes(layer.key)} onChange={() => toggleLayer(layer.key)} />
          </label>
        ))}
      </div>
      <div className="mt-5">
        <label className="text-sm text-slate-400">行政区域</label>
        <select value={selectedRegion} onChange={(event) => setSelectedRegion(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-white/12 bg-slate-950/80 px-3 text-sm">
          <option value="">全部市州</option>
          {regions.map((region) => (
            <option key={region.id} value={region.name}>
              {region.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-5 rounded-md border border-cyanline/20 bg-cyanline/5 p-3 text-xs leading-6 text-slate-300">
        地图、时间轴、知识图谱和文献库联动。当前 MVP 使用代表性点位，后续可接入完整市县 GeoJSON 与权威文化资源库。
      </div>
    </aside>
  );
}
