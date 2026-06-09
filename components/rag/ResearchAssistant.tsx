"use client";

import { useState } from "react";
import { AnswerPanel } from "@/components/rag/AnswerPanel";
import { CitationList } from "@/components/rag/CitationList";
import { QuestionBox } from "@/components/rag/QuestionBox";
import { RetrievedChunkList } from "@/components/rag/RetrievedChunkList";
import { fetchJson } from "@/components/corpus/api";

type RagResult = {
  answer: string;
  citations: any[];
  retrieved_chunks: any[];
  confidence: string;
  llm_provider: string;
};

export function ResearchAssistant() {
  const [question, setQuestion] = useState("都江堰和李冰有什么关系？");
  const [searchType, setSearchType] = useState("hybrid");
  const [result, setResult] = useState<RagResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ask() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJson<RagResult>("/api/rag/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, top_k: 5, search_type: searchType })
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground md:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm uppercase tracking-[0.3em] text-cyanline">RAG Research Assistant</p>
        <h1 className="mt-3 text-4xl font-semibold md:text-6xl">天府学研究助手</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          基于 Tianfu Digital Humanities Corpus 的混合检索问答。无 API KEY 时自动使用本地 fallback 摘要模式，不产生外部模型费用。
        </p>

        {error && <div className="mt-5 rounded-md border border-amberdata/30 bg-amberdata/10 p-3 text-sm text-amberdata">API 暂不可用：{error}</div>}

        <div className="mt-8 grid gap-5 lg:grid-cols-[420px_1fr]">
          <QuestionBox
            question={question}
            setQuestion={setQuestion}
            searchType={searchType}
            setSearchType={setSearchType}
            onAsk={ask}
            loading={loading}
          />
          <AnswerPanel answer={result?.answer} confidence={result?.confidence} provider={result?.llm_provider} />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <CitationList citations={result?.citations || []} />
          <RetrievedChunkList chunks={result?.retrieved_chunks || []} />
        </div>
      </div>
    </main>
  );
}
