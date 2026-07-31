"use client";

import type { LocalAIConfig, LocalAIStatus as Status } from "@/components/rag/local-ai-types";

export function LocalAIStatus({ config, status, onConfigure }: { config: LocalAIConfig; status: Status; onConfigure: () => void }) {
  const mode = !config.enabled ? "知识库 fallback" : config.provider === "ollama" ? "Ollama" : "OpenAI Compatible";
  const statusText = status === "checking" ? "检测中" : status === "connected" ? "连接成功" : status === "failed" ? "连接失败" : "未配置";
  const color = status === "connected" ? "bg-jade" : status === "failed" ? "bg-amberdata" : "bg-slate-500";
  return <div className="glass mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-cyanline/20 p-4 text-sm"><div className="flex flex-wrap items-center gap-3"><span className={`h-2.5 w-2.5 rounded-full ${color}`} /><span>当前模式：<strong>{mode}</strong></span><span className="text-slate-400">状态：{statusText}</span>{config.enabled && config.model && <span className="rounded border border-cyanline/20 px-2 py-1 text-xs text-cyanline">{config.model}</span>}</div><button type="button" onClick={onConfigure} className="cursor-pointer rounded-md border border-cyanline/40 px-3 py-2 font-medium text-cyanline transition hover:bg-cyanline/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyanline active:scale-[0.98]">配置本地 AI</button></div>;
}
