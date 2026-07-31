"use client";

import { useEffect, useState } from "react";
import { AnswerPanel } from "@/components/rag/AnswerPanel";
import { CitationList } from "@/components/rag/CitationList";
import { QuestionBox } from "@/components/rag/QuestionBox";
import { RetrievedChunkList } from "@/components/rag/RetrievedChunkList";
import { fetchJson } from "@/components/corpus/api";
import { LocalAISettings } from "@/components/rag/LocalAISettings";
import { LocalAIStatus } from "@/components/rag/LocalAIStatus";
import { clearLocalAIConfig, generateWithLocalAI, loadLocalAIConfig, localAIErrorMessage, saveLocalAIConfig } from "@/components/rag/local-ai-client";
import { defaultLocalAIConfig, type LocalAIConfig, type LocalAIStatus as LocalAIConnectionStatus } from "@/components/rag/local-ai-types";

type RagResult = {
  answer: string;
  citations: any[];
  chunks?: any[];
  retrieved_chunks: any[];
  confidence: string;
  llm_provider: string;
  mode?: string;
  status?: string;
  model?: string;
  elapsedMs?: number;
};

type RetrievalResult = Pick<RagResult, "citations" | "retrieved_chunks" | "chunks" | "mode" | "status"> & { context: string };

export function ResearchAssistant() {
  const [question, setQuestion] = useState("都江堰和李冰有什么关系？");
  const [searchType, setSearchType] = useState("hybrid");
  const [result, setResult] = useState<RagResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localConfig, setLocalConfig] = useState<LocalAIConfig>(defaultLocalAIConfig);
  const [localStatus, setLocalStatus] = useState<LocalAIConnectionStatus>("unconfigured");
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const saved = loadLocalAIConfig();
    if (saved) setLocalConfig({ ...defaultLocalAIConfig(), ...saved });
  }, []);

  async function fallbackAnswer() {
    return fetchJson<RagResult>("/api/rag/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, top_k: 5, search_type: searchType })
    });
  }

  async function ask() {
    setLoading(true);
    setError(null);
    try {
      if (!localConfig.enabled) {
        setPhase("正在检索资料并生成 fallback 回答…");
        setResult(await fallbackAnswer());
        return;
      }
      setPhase("正在检索资料…");
      const retrieval = await fetchJson<RetrievalResult>("/api/rag/retrieve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, mode: searchType, limit: localConfig.maxContextChunks })
      });
      if (retrieval.status !== "ok" || !retrieval.context.trim()) {
        setPhase("知识库资料不足，正在使用 fallback 回答…");
        setResult(await fallbackAnswer());
        return;
      }
      if (!localConfig.model.trim()) throw new Error("model_missing");
      setPhase("正在调用本地模型…");
      const started = Date.now();
      try {
        const local = await generateWithLocalAI(localConfig, question, retrieval.context);
        setResult({ answer: local.answer, citations: retrieval.citations, retrieved_chunks: retrieval.retrieved_chunks || retrieval.chunks || [], confidence: "medium", llm_provider: localConfig.provider, mode: localConfig.provider === "ollama" ? "local-ollama" : "local-openai-compatible", status: "ok", model: local.model, elapsedMs: Date.now() - started });
        setLocalStatus("connected");
      } catch (localError) {
        setLocalStatus("failed");
        setError(`${localAIErrorMessage(localError)} 已自动回退到知识库 fallback。`);
        setPhase("本地模型不可用，正在使用 fallback 回答…");
        setResult(await fallbackAnswer());
      }
    } catch (err) {
      setError("平台知识库暂时不可用，请确认网络和后端服务后重试。");
    } finally {
      setLoading(false);
      setPhase(null);
    }
  }

  function saveSettings() { saveLocalAIConfig(localConfig); setLocalStatus("unconfigured"); }
  function clearSettings() { clearLocalAIConfig(); setLocalConfig(defaultLocalAIConfig()); }

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground md:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm uppercase tracking-[0.3em] text-cyanline">RAG Research Assistant</p>
        <h1 className="mt-3 text-4xl font-semibold md:text-6xl">天府学研究助手</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          基于 Tianfu Digital Humanities Corpus 的混合检索问答。无 API KEY 时自动使用本地 fallback 摘要模式，不产生外部模型费用。
        </p>
        <LocalAIStatus config={localConfig} status={localStatus} onConfigure={() => setSettingsOpen((value) => !value)} />
        {settingsOpen && <LocalAISettings config={localConfig} onChange={setLocalConfig} onSave={saveSettings} onClear={clearSettings} onClose={() => setSettingsOpen(false)} status={localStatus} setStatus={setLocalStatus} />}

        {error && <div className="mt-5 rounded-md border border-amberdata/30 bg-amberdata/10 p-3 text-sm text-amberdata">API 暂不可用：{error}</div>}

        <div className="mt-8 grid gap-5 lg:grid-cols-[420px_1fr]">
          <QuestionBox
            question={question}
            setQuestion={setQuestion}
            searchType={searchType}
            setSearchType={setSearchType}
            onAsk={ask}
            loading={loading}
            loadingText={phase}
          />
          <AnswerPanel answer={result?.answer} confidence={result?.confidence} provider={result?.llm_provider} mode={result?.mode} model={result?.model} elapsedMs={result?.elapsedMs} />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <CitationList citations={result?.citations || []} />
          <RetrievedChunkList chunks={result?.retrieved_chunks || []} />
        </div>
      </div>
    </main>
  );
}
