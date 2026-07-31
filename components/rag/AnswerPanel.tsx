"use client";

type Props = {
  answer?: string;
  confidence?: string;
  provider?: string;
  mode?: string;
  model?: string;
  elapsedMs?: number;
};

export function AnswerPanel({ answer, confidence, provider, mode, model, elapsedMs }: Props) {
  return (
    <div className="glass rounded-lg p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">回答</h2>
        <div className="flex gap-2 text-xs">
          {confidence && <span className="rounded-md border border-jade/20 bg-jade/10 px-2 py-1 text-jade">置信度：{confidence}</span>}
          {provider && <span className="rounded-md border border-cyanline/20 bg-cyanline/10 px-2 py-1 text-cyanline">{provider}</span>}
          {mode && <span className="rounded-md border border-violetline/20 bg-violetline/10 px-2 py-1 text-violetline">{mode}</span>}
        </div>
      </div>
      {(model || elapsedMs !== undefined) && <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">{model && <span>本地模型：{model}</span>}{elapsedMs !== undefined && <span>响应耗时：{(elapsedMs / 1000).toFixed(1)} 秒</span>}</div>}
      <div className="mt-4 whitespace-pre-wrap rounded-md border border-white/10 bg-slate-950/60 p-4 text-sm leading-7 text-slate-200">
        {answer || "请输入问题，系统将基于当前知识库检索并生成带引用的回答。"}
      </div>
    </div>
  );
}
