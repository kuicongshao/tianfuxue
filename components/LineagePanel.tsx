"use client";

import { motion } from "framer-motion";
import { methods, themes } from "@/lib/tianfu-data";

const literature = [
  { title: "天府文化的地域生成与现代转化", author: "李明", year: 2021, cites: 86 },
  { title: "巴蜀文化传播的媒介化路径研究", author: "周岚", year: 2023, cites: 42 },
  { title: "数字人文视角下的地方学知识组织", author: "Chen et al.", year: 2024, cites: 31 }
];

export function LineagePanel() {
  return (
    <section id="lineage" className="relative z-10 px-5 py-16 md:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm uppercase tracking-[0.3em] text-cyanline">Research Lineage</p>
        <h2 className="mt-3 text-3xl font-semibold md:text-5xl">文脉梳理</h2>
        <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="glass rounded-lg p-6">
            <div className="grid gap-3 md:grid-cols-5">
              {["地方学", "天府学", "文化研究", "传播学", "历史学"].map((node, index) => (
                <motion.div
                  key={node}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  viewport={{ once: true }}
                  className="rounded-md border border-cyanline/20 bg-cyanline/5 p-4 text-center text-sm font-semibold"
                >
                  {node}
                </motion.div>
              ))}
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold">研究主题谱系</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {themes.map((theme) => (
                    <span key={theme} className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">方法谱系</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {methods.map((method) => (
                    <span key={method} className="rounded-md border border-violetline/20 bg-violetline/10 px-3 py-2 text-sm text-slate-200">
                      {method}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="glass rounded-lg p-6">
            <h3 className="text-lg font-semibold">关键文献推荐</h3>
            <div className="mt-4 space-y-3">
              {literature.map((item) => (
                <article key={item.title} className="rounded-md border border-white/10 bg-white/[0.03] p-3">
                  <div className="font-semibold">{item.title}</div>
                  <div className="mt-1 text-sm text-slate-400">
                    {item.author} · {item.year} · 引用 {item.cites}
                  </div>
                  <p className="mt-2 text-sm text-slate-300">摘要：围绕天府文化知识生产、媒介传播与地方身份建构展开分析。</p>
                </article>
              ))}
            </div>
            <div className="mt-4 rounded-md border border-amberdata/20 bg-amberdata/10 p-3 text-sm text-slate-200">
              研究缺口：跨平台短视频语料、县域文化遗产 GIS 数据、非遗传承人网络与文献计量之间仍缺少联动研究。
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
