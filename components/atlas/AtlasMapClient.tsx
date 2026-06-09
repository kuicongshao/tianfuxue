"use client";

import "leaflet/dist/leaflet.css";

import { CircleMarker, GeoJSON, MapContainer, Popup, TileLayer } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import sichuanGeoJson from "@/public/data/sichuan.json";
import type { AtlasObject, Region } from "@/components/atlas/types";

const colors: Record<string, string> = {
  heritage: "#44d4ff",
  intangible: "#2be6b7",
  museum: "#8f6bff",
  event: "#f4c95d"
};

export function AtlasMap({ objects, regions, onSelect }: { objects: AtlasObject[]; regions: Region[]; onSelect: (id: string) => void }) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/12 shadow-glow">
      <MapContainer center={[30.65, 104.06] as LatLngExpression} zoom={7} scrollWheelZoom className="z-0 min-h-[620px]">
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <GeoJSON
          key="sichuan-boundary"
          data={sichuanGeoJson as never}
          style={() => ({ color: "#44d4ff", weight: 1.2, fillColor: "#142650", fillOpacity: 0.14 })}
        />
        {regions.map((region) => (
          <CircleMarker key={region.id} center={[region.lat, region.lng]} radius={4} pathOptions={{ color: "#94a3b8", fillColor: "#94a3b8", fillOpacity: 0.55, weight: 1 }}>
            <Popup>
              <div className="max-w-xs text-slate-900">
                <strong>{region.name}</strong>
                <p>{region.intro}</p>
                <p>面积：{region.area_km2} km² · 人口：{region.population_million} 百万</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
        {objects.map((item) => (
          <CircleMarker
            key={item.id}
            center={[item.lat, item.lng]}
            radius={9}
            eventHandlers={{ click: () => onSelect(item.id) }}
            pathOptions={{ color: colors[item.layer], fillColor: colors[item.layer], fillOpacity: 0.8, weight: 2 }}
          >
            <Popup>
              <div className="max-w-xs text-slate-900">
                <strong>{item.name}</strong>
                <p>{item.intro}</p>
                <button onClick={() => onSelect(item.id)}>查看知识卡片</button>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

export default AtlasMap;
