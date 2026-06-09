"use client";

const eras = ["全部", "先秦", "秦汉", "三国", "隋唐", "宋元", "明清", "近代", "现代"];

export function AtlasTimeline({ activeEra, setActiveEra }: { activeEra: string; setActiveEra: (era: string) => void }) {
  return (
    <div className="glass rounded-lg p-4">
      <div className="mb-3 text-sm font-semibold text-slate-300">Timeline</div>
      <div className="grid gap-2 md:grid-cols-9">
        {eras.map((era) => (
          <button
            key={era}
            onClick={() => setActiveEra(era)}
            className={`h-10 rounded-md border px-3 text-sm transition ${
              activeEra === era ? "border-cyanline bg-cyanline text-slate-950" : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/10"
            }`}
          >
            {era}
          </button>
        ))}
      </div>
    </div>
  );
}
