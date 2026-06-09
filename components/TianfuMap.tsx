"use client";

import dynamic from "next/dynamic";

const TianfuMapClient = dynamic(() => import("./TianfuMapClient"), {
  ssr: false,
  loading: () => (
    <section id="atlas" className="relative z-10 px-5 py-16 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="glass min-h-[560px] rounded-lg p-6 text-sm text-slate-400">地图加载中...</div>
      </div>
    </section>
  )
});

export function TianfuMap() {
  return <TianfuMapClient />;
}
