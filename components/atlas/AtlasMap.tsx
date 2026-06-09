"use client";

import dynamic from "next/dynamic";
import type { AtlasObject, Region } from "@/components/atlas/types";

const AtlasMapClient = dynamic(() => import("@/components/atlas/AtlasMapClient"), {
  ssr: false,
  loading: () => <div className="glass min-h-[620px] rounded-lg p-6 text-sm text-slate-400">地图加载中...</div>
});

export function AtlasMap({ objects, regions, onSelect }: { objects: AtlasObject[]; regions: Region[]; onSelect: (id: string) => void }) {
  return <AtlasMapClient objects={objects} regions={regions} onSelect={onSelect} />;
}
