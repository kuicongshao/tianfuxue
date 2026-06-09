"use client";

import "leaflet/dist/leaflet.css";

import { useMemo, useState } from "react";
import { CircleMarker, GeoJSON, MapContainer, Popup, TileLayer } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import { AnimatePresence, motion } from "framer-motion";
import { Layers, MapPinned } from "lucide-react";
import sichuanGeoJson from "@/public/data/sichuan.json";
import { layerLabels, type LayerKey, mapPoints, timeline } from "@/lib/tianfu-data";
import { Button } from "@/components/ui/button";

const layerColors: Record<LayerKey, string> = {
  heritage: "#44d4ff",
  architecture: "#8f6bff",
  intangible: "#2be6b7",
  event: "#f4c95d",
  scholar: "#ff7ab6",
  literature: "#9be564"
};

export function TianfuMap() {
  const [activeLayers, setActiveLayers] = useState<LayerKey[]>(["heritage", "architecture", "intangible", "event", "literature"]);
  const [activeEra, setActiveEra] = useState("全部");

  const visiblePoints = useMemo(
    () => mapPoints.filter((point) => activeLayers.includes(point.layer) && (activeEra === "全部" || point.era === activeEra)),
    [activeEra, activeLayers]
  );

  function toggleLayer(layer: LayerKey) {
    setActiveLayers((current) => (current.includes(layer) ? current.filter((item) => item !== layer) : [...current, layer]));
  }

  return (
    <section id="atlas" className="relative z-10 px-5 py-16 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyanline">Sichuan GIS Atlas</p>
            <h2 className="mt-3 text-3xl font-semibold md:text-5xl">天府学研究舆图</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {["全部", ...timeline].map((era) => (
              <Button key={era} variant={activeEra === era ? "primary" : "outline"} onClick={() => setActiveEra(era)} className="h-9 px-3">
                {era}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <aside className="glass rounded-lg p-4">
            <div className="mb-4 flex items-center gap-2 text-base font-semibold">
              <Layers className="h-5 w-5 text-cyanline" />
              数据图层
            </div>
            <div className="space-y-2">
              {(Object.keys(layerLabels) as LayerKey[]).map((layer) => (
                <label key={layer} className="flex cursor-pointer items-center justify-between rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: layerColors[layer] }} />
                    {layerLabels[layer]}
                  </span>
                  <input type="checkbox" checked={activeLayers.includes(layer)} onChange={() => toggleLayer(layer)} />
                </label>
              ))}
            </div>

            <div className="mt-5 rounded-md border border-cyanline/20 bg-cyanline/5 p-3 text-sm text-slate-300">
              当前筛选出 <span className="font-semibold text-cyanline">{visiblePoints.length}</span> 个知识点位。点击地图点位查看名称、简介、年代、关键词、参考文献与相关研究。
            </div>
          </aside>

          <div className="overflow-hidden rounded-lg border border-white/12 shadow-glow">
            <MapContainer center={[30.65, 104.06] as LatLngExpression} zoom={7} scrollWheelZoom className="z-0">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <GeoJSON
                key="sichuan-boundary"
                data={sichuanGeoJson as never}
                style={() => ({
                  color: "#44d4ff",
                  weight: 1.2,
                  fillColor: "#142650",
                  fillOpacity: 0.14
                })}
              />
              <AnimatePresence>
                {visiblePoints.map((point) => (
                  <CircleMarker
                    key={point.id}
                    center={point.position}
                    radius={8}
                    pathOptions={{
                      color: layerColors[point.layer],
                      fillColor: layerColors[point.layer],
                      fillOpacity: 0.75,
                      weight: 2
                    }}
                  >
                    <Popup>
                      <div className="max-w-xs text-slate-900">
                        <strong>{point.name}</strong>
                        <p>{point.summary}</p>
                        <p>年代：{point.era}</p>
                        <p>关键词：{point.keywords.join("、")}</p>
                        <p>参考文献：{point.references.join("；")}</p>
                        <p>相关研究：{point.related.join("、")}</p>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </AnimatePresence>
            </MapContainer>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-4 flex items-center gap-2 text-sm text-slate-400"
        >
          <MapPinned className="h-4 w-4 text-jade" />
          地图边界文件来自四川省行政区划 GeoJSON，后续可替换为民政部或测绘主管部门审定数据。
        </motion.div>
      </div>
    </section>
  );
}

export default TianfuMap;
