"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import { Layers, MapPinned } from "lucide-react";
import { layerLabels, mapPoints, timeline, type LayerKey } from "@/lib/tianfu-data";
import { Button } from "@/components/ui/button";

const subdomains = ["0", "1", "2", "3", "4", "5", "6", "7"];
const layerColors: Record<LayerKey, string> = {
  heritage: "#44d4ff", architecture: "#8f6bff", intangible: "#2be6b7",
  event: "#f4c95d", scholar: "#ff7ab6", literature: "#9be564"
};

function wmtsUrl(layer: "vec" | "cva", token: string) {
  return `https://t{s}.tianditu.gov.cn/${layer}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${layer}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${token}`;
}

export function TianfuMap() {
  const [activeLayers, setActiveLayers] = useState<LayerKey[]>(["heritage", "architecture", "intangible", "event", "literature"]);
  const [activeEra, setActiveEra] = useState("全部");
  const [retryKey, setRetryKey] = useState(0);
  const token = process.env.NEXT_PUBLIC_TIANDITU_TOKEN?.trim();
  const visiblePoints = useMemo(
    () => mapPoints.filter((point) => activeLayers.includes(point.layer) && (activeEra === "全部" || point.era === activeEra)),
    [activeEra, activeLayers]
  );
  const toggleLayer = (layer: LayerKey) => setActiveLayers((current) => current.includes(layer) ? current.filter((item) => item !== layer) : [...current, layer]);

  return <section id="atlas" className="relative z-10 px-5 py-16 md:px-10"><div className="mx-auto max-w-7xl">
    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm uppercase tracking-[0.3em] text-cyanline">Sichuan GIS Atlas</p><h2 className="mt-3 text-3xl font-semibold md:text-5xl">天府学研究舆图</h2></div><div className="flex flex-wrap gap-2">{["全部", ...timeline].map((era) => <Button key={era} variant={activeEra === era ? "primary" : "outline"} onClick={() => setActiveEra(era)} className="h-9 px-3">{era}</Button>)}</div></div>
    <div className="grid gap-5 lg:grid-cols-[280px_1fr]"><aside className="glass rounded-lg p-4"><div className="mb-4 flex items-center gap-2 text-base font-semibold"><Layers className="h-5 w-5 text-cyanline" />数据图层</div><div className="space-y-2">{(Object.keys(layerLabels) as LayerKey[]).map((layer) => <label key={layer} className="flex cursor-pointer items-center justify-between rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: layerColors[layer] }} />{layerLabels[layer]}</span><input type="checkbox" checked={activeLayers.includes(layer)} onChange={() => toggleLayer(layer)} /></label>)}</div><div className="mt-5 rounded-md border border-cyanline/20 bg-cyanline/5 p-3 text-sm text-slate-300">当前筛选出 <span className="font-semibold text-cyanline">{visiblePoints.length}</span> 个知识点位。业务点位坐标系为 <code>unknown</code>，待人工核验。</div></aside>
      <div className="overflow-hidden rounded-lg border border-white/12 shadow-glow">{!token ? <MapNotice retry={() => setRetryKey((value) => value + 1)} /> : <div key={retryKey} className="relative z-0"><MapContainer center={[30.67, 104.06]} zoom={7} className="min-h-[620px] w-full" scrollWheelZoom><LeafletPrefix /><TileLayer url={wmtsUrl("vec", token)} subdomains={subdomains} maxZoom={18} attribution="地图服务：国家地理信息公共服务平台 天地图" /><TileLayer url={wmtsUrl("cva", token)} subdomains={subdomains} maxZoom={18} />{visiblePoints.map((point) => <CircleMarker key={point.id} center={point.position} radius={8} pathOptions={{ color: "#fff", weight: 1.5, fillColor: layerColors[point.layer], fillOpacity: 0.9 }}><Popup><strong>{point.name}</strong><p>{point.summary}</p><p>时代：{point.era}</p><p>坐标系：unknown</p></Popup></CircleMarker>)}</MapContainer></div>}<MapAttribution /></div>
    </div><div className="mt-4 flex items-center gap-2 text-sm text-slate-400"><MapPinned className="h-4 w-4 text-jade" />生产地图不渲染本地行政区 GeoJSON；该边界文件仅保留为 LEGACY / RESEARCH-ONLY。</div>
  </div></section>;
}

function MapNotice({ retry }: { retry: () => void }) { return <div className="glass flex min-h-[620px] flex-col items-center justify-center gap-4 rounded-lg p-6 text-center"><p className="max-w-md text-sm leading-7 text-amberdata">天地图服务尚未配置，请在部署环境中设置 NEXT_PUBLIC_TIANDITU_TOKEN。</p><button type="button" onClick={retry} className="cursor-pointer rounded-md border border-cyanline/40 px-4 py-2 text-sm text-cyanline hover:bg-cyanline/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyanline active:scale-[0.98]">重试</button></div>; }
function LeafletPrefix() { const map = useMap(); useEffect(() => { map.attributionControl.setPrefix("Leaflet"); }, [map]); return null; }
function MapAttribution() { return <div className="border-t border-white/10 bg-slate-950/80 p-3 text-xs text-slate-400">地图服务由国家地理信息公共服务平台“天地图”提供。版权和审图信息以官方服务要求为准。</div>; }

export default TianfuMap;
