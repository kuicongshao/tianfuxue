"use client";

import { Send, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  question: string;
  setQuestion: (value: string) => void;
  searchType: string;
  setSearchType: (value: string) => void;
  onAsk: () => void;
  loading: boolean;
};

export function QuestionBox({ question, setQuestion, searchType, setSearchType, onAsk, loading }: Props) {
  return (
    <div className="glass rounded-lg p-5">
      <div className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <Search className="h-5 w-5 text-cyanline" />
        天府学知识库问答
      </div>
      <textarea
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        placeholder="例如：都江堰和李冰在天府文化研究中有什么关系？"
        className="min-h-36 w-full rounded-md border border-white/12 bg-slate-950/70 p-3 text-sm text-slate-100 outline-none focus:border-cyanline"
      />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <select
          value={searchType}
          onChange={(event) => setSearchType(event.target.value)}
          className="h-10 rounded-md border border-white/12 bg-slate-950/80 px-3 text-sm"
        >
          <option value="hybrid">hybrid 混合检索</option>
          <option value="keyword">keyword 关键词检索</option>
          <option value="vector">vector 语义检索</option>
        </select>
        <Button onClick={onAsk} disabled={loading || !question.trim()}>
          <Send className="h-4 w-4" />
          {loading ? "检索中..." : "提问"}
        </Button>
      </div>
    </div>
  );
}
