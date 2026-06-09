"use client";

type Chunk = {
  chunk_id: string;
  title: string;
  text: string;
  score: number;
};

export function RetrievedChunkList({ chunks }: { chunks: Chunk[] }) {
  return (
    <div className="glass rounded-lg p-5">
      <h2 className="text-lg font-semibold">检索片段</h2>
      <div className="mt-4 space-y-3">
        {chunks.map((chunk) => (
          <article key={chunk.chunk_id} className="rounded-md border border-white/10 bg-white/[0.03] p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">{chunk.title}</h3>
              <span className="text-xs text-cyanline">{chunk.score}</span>
            </div>
            <p className="mt-2 line-clamp-5 text-sm leading-6 text-slate-300">{chunk.text}</p>
          </article>
        ))}
        {!chunks.length && <div className="rounded-md border border-white/10 p-6 text-center text-slate-500">暂无检索片段</div>}
      </div>
    </div>
  );
}
