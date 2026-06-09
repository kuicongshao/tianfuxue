"use client";

import { useState } from "react";
import { GitBranch, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { frameworkMermaid } from "@/lib/tianfu-data";

export function FrameworkBuilder() {
  const [idea, setIdea] = useState("三星堆短视频传播");

  return (
    <section id="framework" className="relative z-10 px-5 py-16 md:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm uppercase tracking-[0.3em] text-cyanline">Research Framework</p>
        <h2 className="mt-3 text-3xl font-semibold md:text-5xl">研究框架构建</h2>
        <div className="mt-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="glass rounded-lg p-6">
            <label className="text-sm text-slate-300">研究想法</label>
            <textarea
              value={idea}
              onChange={(event) => setIdea(event.target.value)}
              className="mt-3 min-h-32 w-full rounded-md border border-white/12 bg-slate-950/70 p-3 text-slate-100 outline-none focus:border-cyanline"
            />
            <Button className="mt-4">
              <WandSparkles className="h-4 w-4" />
              生成研究设计
            </Button>
            <div className="mt-5 grid gap-3 text-sm">
              {["理论基础：媒介化、文化记忆、地方认同", "核心概念：观看、互动、叙事、认同", "研究问题：短视频如何重构三星堆公共想象", "变量设计：内容类型、情感倾向、互动强度、文化符号", "方法建议：内容分析 + 主题模型 + 情感分析 + 访谈", "数据来源：抖音、B站、微博、博物馆公开资料"].map((text) => (
                <div key={text} className="rounded-md border border-white/10 bg-white/[0.03] p-3">
                  {text}
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-lg p-6">
            <div className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <GitBranch className="h-5 w-5 text-jade" />
              Mermaid 研究框架图
            </div>
            <pre className="overflow-auto rounded-md border border-cyanline/20 bg-slate-950/80 p-4 text-sm text-cyan-100">
              <code>{frameworkMermaid}</code>
            </pre>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {["理论", "数据", "方法"].map((item) => (
                <div key={item} className="rounded-md border border-violetline/20 bg-violetline/10 p-4 text-center">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
