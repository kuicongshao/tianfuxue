"use client";

type Citation = {
  index: number;
  title: string;
  chunk_id: string;
  source_path?: string;
  score: number;
};

export function CitationList({ citations }: { citations: Citation[] }) {
  return (
    <div className="glass rounded-lg p-5">
      <h2 className="text-lg font-semibold">引用来源</h2>
      <div className="mt-4 space-y-3">
        {citations.map((citation) => (
          <article key={`${citation.index}-${citation.chunk_id}`} className="rounded-md border border-white/10 bg-white/[0.03] p-3 text-sm">
            <div className="font-semibold">
              [{citation.index}] {citation.title}
            </div>
            <div className="mt-2 text-xs text-slate-400">score: {citation.score} · chunk: {citation.chunk_id}</div>
            {citation.source_path && <div className="mt-1 break-all text-xs text-slate-500">{citation.source_path}</div>}
          </article>
        ))}
        {!citations.length && <div className="rounded-md border border-white/10 p-6 text-center text-slate-500">暂无引用</div>}
      </div>
    </div>
  );
}
