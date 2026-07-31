"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

type Literature = {
  title: string;
  author: string;
  year: number;
  cites: number;
  theme: string;
  method: string;
  summary: string;
};

type DisciplineData = {
  themes: string[];
  methods: string[];
  gap: string;
};

const disciplineData: Record<string, DisciplineData> = {
  "地方学": { themes: ["天府文化", "巴蜀文化", "成都城市文化", "都江堰"], methods: ["内容分析", "GIS分析", "数字人文"], gap: "县域文化资料、空间数据与跨媒介传播证据尚未形成可复用的联动研究。" },
  "天府学": { themes: ["天府文化", "川菜", "蜀学", "巴蜀文化"], methods: ["内容分析", "文本挖掘", "数字人文"], gap: "天府学概念的跨学科定义、可检索语料与长期研究指标仍需统一。" },
  "文化研究": { themes: ["天府文化", "川菜", "三星堆", "巴蜀文化"], methods: ["内容分析", "主题模型", "情感分析"], gap: "日常文化实践与平台文化表征之间缺少可比较的连续样本。" },
  "传播学": { themes: ["三星堆", "成都城市文化", "川菜", "天府文化"], methods: ["内容分析", "文本挖掘", "情感分析"], gap: "短视频、新闻和公共传播数据仍缺少跨平台、跨时间段的对照研究。" },
  "历史学": { themes: ["蜀学", "都江堰", "三星堆", "巴蜀文化"], methods: ["文本挖掘", "GIS分析", "数字人文"], gap: "历史文献、遗址空间和地方记忆之间仍缺少可追溯的证据链。" }
};

const literature: Literature[] = [
  { title: "天府文化的地域生成与现代转化", author: "李明", year: 2021, cites: 86, theme: "天府文化", method: "内容分析", summary: "以天府文化的公共叙事与地方认同为线索，讨论地域文化如何在现代媒介和城市实践中被重新阐释。" },
  { title: "巴蜀文化传播的媒介化路径研究", author: "周岚", year: 2023, cites: 42, theme: "巴蜀文化", method: "文本挖掘", summary: "比较新闻、社交媒体和展陈文本中的巴蜀文化表述，提出跨媒介语料整理的研究路径。" },
  { title: "数字人文视角下的地方学知识组织", author: "Chen et al.", year: 2024, cites: 31, theme: "蜀学", method: "数字人文", summary: "以实体、关系和空间信息组织地方学资料，说明可追溯知识网络在区域研究中的应用边界。" }
];

const methodDetails: Record<string, { intro: string; questions: string; themes: string; href: string; label: string }> = {
  "内容分析": { intro: "对文本、图像或视频中的主题、框架和叙事进行系统编码。", questions: "适合比较天府文化、川菜或城市形象如何被表达。", themes: "天府文化、川菜、成都城市文化", href: "/research-assistant", label: "进入研究助手" },
  "文本挖掘": { intro: "从大规模语料中提取关键词、实体与共现关系。", questions: "适合追踪巴蜀文化、蜀学和历史文献中的概念演变。", themes: "蜀学、巴蜀文化、三星堆", href: "/research-assistant", label: "进入研究助手" },
  "主题模型": { intro: "从文本集合中识别潜在议题及其变化。", questions: "适合分析新闻、论文或社交媒体的研究热点。", themes: "天府文化、成都城市文化、三星堆", href: "/research-assistant", label: "进入研究助手" },
  "情感分析": { intro: "识别文本中的情绪倾向与评价特征。", questions: "适合观察公共传播中的文化认同和旅游感知。", themes: "川菜、三星堆、成都城市文化", href: "/research-assistant", label: "进入研究助手" },
  "GIS分析": { intro: "将地点、路线和时间信息放入地理空间中比较。", questions: "适合研究都江堰、遗产点位和城市文化空间。", themes: "都江堰、巴蜀文化、成都城市文化", href: "/atlas", label: "进入文化舆图" },
  "数字人文": { intro: "把文献、实体、关系和空间资料组织为可复用的研究基础设施。", questions: "适合建设可查询、可追溯的天府学语料与知识图谱。", themes: "天府文化、蜀学、巴蜀文化", href: "/corpus", label: "进入文献库" }
};

export function LineagePanel() {
  const [activeDiscipline, setActiveDiscipline] = useState("地方学");
  const [activeTheme, setActiveTheme] = useState("天府文化");
  const [activeMethod, setActiveMethod] = useState("内容分析");
  const [expandedLiterature, setExpandedLiterature] = useState<string | null>(null);

  const current = disciplineData[activeDiscipline];
  const matchingLiterature = useMemo(
    () => literature.filter((item) => current.themes.includes(item.theme) || item.theme === activeTheme || current.methods.includes(item.method)),
    [activeTheme, current]
  );
  const relatedMethods = methodDetails[activeMethod];

  function chooseDiscipline(discipline: string) {
    setActiveDiscipline(discipline);
    setActiveTheme(disciplineData[discipline].themes[0]);
    setActiveMethod(disciplineData[discipline].methods[0]);
    setExpandedLiterature(null);
  }

  return (
    <section id="lineage" className="relative z-10 px-5 py-16 md:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm uppercase tracking-[0.3em] text-cyanline">Research Lineage</p>
        <h2 className="mt-3 text-3xl font-semibold md:text-5xl">文脉梳理</h2>
        <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="glass rounded-lg p-6">
            <div className="grid gap-3 md:grid-cols-5" role="tablist" aria-label="研究学科">
              {Object.keys(disciplineData).map((node, index) => (
                <motion.button key={node} type="button" role="tab" aria-selected={activeDiscipline === node} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} viewport={{ once: true }} onClick={() => chooseDiscipline(node)} className={`cursor-pointer rounded-md border p-4 text-center text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyanline ${activeDiscipline === node ? "border-cyanline bg-cyanline text-slate-950" : "border-cyanline/20 bg-cyanline/5 hover:border-cyanline/60 hover:bg-cyanline/10 active:scale-[0.98]"}`}>
                  {node}
                </motion.button>
              ))}
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold">研究主题谱系</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {current.themes.map((theme) => (
                    <button key={theme} type="button" onClick={() => setActiveTheme(theme)} className={`cursor-pointer rounded-md border px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyanline ${activeTheme === theme ? "border-cyanline bg-cyanline/20 text-cyanline" : "border-white/10 bg-white/5 text-slate-200 hover:border-cyanline/50 active:scale-[0.98]"}`}>
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">方法谱系</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {current.methods.map((method) => (
                    <button key={method} type="button" onClick={() => setActiveMethod(method)} className={`cursor-pointer rounded-md border px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violetline ${activeMethod === method ? "border-violetline bg-violetline/25 text-white" : "border-violetline/20 bg-violetline/10 text-slate-200 hover:border-violetline/60 active:scale-[0.98]"}`}>
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-5 rounded-md border border-cyanline/20 bg-cyanline/5 p-4 text-sm leading-6 text-slate-200">
              <div className="font-semibold text-cyanline">{activeTheme} · 主题反馈</div>
              <p className="mt-1">当前分类为“{activeDiscipline}”。可结合 {current.methods.join("、")} 研究该主题；相关地区与文化实体可在文化舆图中继续查看。</p>
            </div>
            <div className="mt-4 rounded-md border border-violetline/20 bg-violetline/10 p-4 text-sm leading-6 text-slate-200">
              <div className="font-semibold text-violetline">{activeMethod} · 方法说明</div>
              <p className="mt-1">{relatedMethods.intro}</p>
              <p>适用问题：{relatedMethods.questions}</p>
              <p>相关主题：{relatedMethods.themes}</p>
              <Link href={relatedMethods.href} className="mt-3 inline-flex cursor-pointer rounded-md border border-violetline/40 px-3 py-2 text-sm font-medium text-white transition hover:bg-violetline/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violetline active:scale-[0.98]">
                {relatedMethods.label}
              </Link>
            </div>
          </div>
          <div className="glass rounded-lg p-6">
            <h3 className="text-lg font-semibold">关键文献推荐</h3>
            <div className="mt-4 space-y-3">
              {matchingLiterature.map((item) => {
                const expanded = expandedLiterature === item.title;
                return (
                  <article key={item.title} className="rounded-md border border-white/10 bg-white/[0.03] p-3">
                    <button type="button" aria-expanded={expanded} onClick={() => setExpandedLiterature(expanded ? null : item.title)} className="w-full cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyanline">
                      <div className="flex items-center justify-between gap-2"><span className="font-semibold">{item.title}</span><span className="shrink-0 rounded border border-amberdata/30 px-1.5 py-0.5 text-xs text-amberdata">示例数据</span></div>
                      <div className="mt-1 text-sm text-slate-400">{item.author} · {item.year} · 引用 {item.cites}</div>
                      <div className="mt-1 text-xs text-cyanline">主题：{item.theme} · 方法：{item.method}</div>
                    </button>
                    {expanded && <p className="mt-3 border-t border-white/10 pt-3 text-sm leading-6 text-slate-300">摘要：{item.summary}</p>}
                  </article>
                );
              })}
              {!matchingLiterature.length && <div className="rounded-md border border-white/10 p-5 text-center text-sm text-slate-400">当前分类暂无匹配内容。</div>}
            </div>
            <div className="mt-4 rounded-md border border-amberdata/20 bg-amberdata/10 p-3 text-sm text-slate-200"><span className="font-semibold text-amberdata">研究缺口：</span>{current.gap}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
