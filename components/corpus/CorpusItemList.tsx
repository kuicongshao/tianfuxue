"use client";

type CorpusItem = {
  id: string;
  title: string;
  layer: string;
  source_type: string;
  ingest_status: string;
  chunk_count?: number;
  entity_mention_count?: number;
  duplicate_of?: string | null;
};

export function CorpusItemList({ items }: { items: CorpusItem[] }) {
  return (
    <div className="glass rounded-lg p-5">
      <h2 className="text-lg font-semibold">文献条目</h2>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-md border border-white/10 bg-white/[0.03] p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">{item.title}</h3>
              <span className="rounded-md border border-cyanline/20 bg-cyanline/10 px-2 py-1 text-xs text-cyanline">{item.ingest_status}</span>
            </div>
            <div className="mt-2 grid gap-2 text-xs text-slate-400 md:grid-cols-4">
              <span>{item.layer}</span>
              <span>{item.source_type}</span>
              <span>chunks: {item.chunk_count || 0}</span>
              <span>entities: {item.entity_mention_count || 0}</span>
            </div>
            {item.duplicate_of && <p className="mt-2 text-xs text-amberdata">重复条目：{item.duplicate_of}</p>}
          </article>
        ))}
        {!items.length && <div className="rounded-md border border-white/10 p-8 text-center text-slate-500">暂无文献条目</div>}
      </div>
    </div>
  );
}
