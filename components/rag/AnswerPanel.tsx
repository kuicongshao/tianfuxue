"use client";

type Props = {
  answer?: string;
  confidence?: string;
  provider?: string;
};

export function AnswerPanel({ answer, confidence, provider }: Props) {
  return (
    <div className="glass rounded-lg p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">回答</h2>
        <div className="flex gap-2 text-xs">
          {confidence && <span className="rounded-md border border-jade/20 bg-jade/10 px-2 py-1 text-jade">置信度：{confidence}</span>}
          {provider && <span className="rounded-md border border-cyanline/20 bg-cyanline/10 px-2 py-1 text-cyanline">{provider}</span>}
        </div>
      </div>
      <div className="mt-4 whitespace-pre-wrap rounded-md border border-white/10 bg-slate-950/60 p-4 text-sm leading-7 text-slate-200">
        {answer || "请输入问题，系统将基于当前知识库检索并生成带引用的回答。"}
      </div>
    </div>
  );
}
