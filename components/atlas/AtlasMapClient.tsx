"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import type { AtlasObject, Region } from "@/components/atlas/types";

const subdomains = ["0", "1", "2", "3", "4", "5", "6", "7"];
const colors: Record<string, string> = { heritage: "#44d4ff", intangible: "#2be6b7", museum: "#8f6bff", event: "#f4c95d" };
function wmtsUrl(layer: "vec" | "cva", token: string) { return `https://t{s}.tianditu.gov.cn/${layer}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${layer}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${token}`; }

export function AtlasMap({ objects, regions, onSelect }: { objects: AtlasObject[]; regions: Region[]; onSelect: (id: string) => void }) {
  const token = process.env.NEXT_PUBLIC_TIANDITU_TOKEN?.trim();
  const retry = () => window.location.reload();
  if (!token) return <MapNotice retry={retry} />;
  return <div className="overflow-hidden rounded-lg border border-white/12 shadow-glow"><div className="relative z-0"><MapContainer center={[30.67, 104.06]} zoom={7} className="min-h-[620px] w-full" scrollWheelZoom><LeafletPrefix /><TileLayer url={wmtsUrl("vec", token)} subdomains={subdomains} maxZoom={18} attribution="地图服务：国家地理信息公共服务平台 天地图" /><TileLayer url={wmtsUrl("cva", token)} subdomains={subdomains} maxZoom={18} />{regions.map((region) => <CircleMarker key={region.id} center={[region.lat, region.lng]} radius={4} pathOptions={{ color: "#fff", weight: 1, fillColor: "#94a3b8", fillOpacity: 0.85 }}><Popup><strong>{region.name}</strong><p>{region.intro}</p><p>坐标系：unknown</p></Popup></CircleMarker>)}{objects.map((item) => <CircleMarker key={item.id} center={[item.lat, item.lng]} radius={9} pathOptions={{ color: "#fff", weight: 1.5, fillColor: colors[item.layer], fillOpacity: 0.9 }} eventHandlers={{ click: () => onSelect(item.id) }}><Popup><strong>{item.name}</strong><p>{item.intro}</p><button type="button" onClick={() => onSelect(item.id)} className="cursor-pointer text-cyan-700 underline">查看知识卡</button><p>坐标系：unknown</p></Popup></CircleMarker>)}</MapContainer></div><MapAttribution /></div>;
}

function MapNotice({ retry }: { retry: () => void }) { return <div className="glass flex min-h-[620px] flex-col items-center justify-center gap-4 rounded-lg p-6 text-center"><p className="max-w-md text-sm leading-7 text-amberdata">天地图服务尚未配置，请在部署环境中设置 NEXT_PUBLIC_TIANDITU_TOKEN。</p><button type="button" onClick={retry} className="cursor-pointer rounded-md border border-cyanline/40 px-4 py-2 text-sm text-cyanline hover:bg-cyanline/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyanline active:scale-[0.98]">重试</button></div>; }
function LeafletPrefix() { const map = useMap(); useEffect(() => { map.attributionControl.setPrefix("Leaflet"); }, [map]); return null; }
function MapAttribution() { return <div className="border-t border-white/10 bg-slate-950/80 p-3 text-xs text-slate-400">地图服务由国家地理信息公共服务平台“天地图”提供。版权和审图信息以官方服务要求为准。业务点位坐标系当前标记为 unknown。</div>; }

export default AtlasMap;
