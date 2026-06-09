import { ArrowRight, Database, FileText, ShieldCheck } from "lucide-react";
import { CorpusInfrastructure } from "@/components/CorpusInfrastructure";
import { FrameworkBuilder } from "@/components/FrameworkBuilder";
import { KnowledgeBackground } from "@/components/KnowledgeBackground";
import { LineagePanel } from "@/components/LineagePanel";
import { ParticleField } from "@/components/ParticleField";
import { TianfuMap } from "@/components/TianfuMap";
import { Button } from "@/components/ui/button";
import { agents, entries, stats } from "@/lib/tianfu-data";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <section className="mountain-field relative min-h-[92vh] px-5 py-8 md:px-10">
        <KnowledgeBackground />
        <ParticleField />
        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between">
          <div className="text-sm font-semibold tracking-[0.24em] text-cyanline">TIANFU STUDIES AI</div>
          <div className="hidden items-center gap-5 text-sm text-slate-300 md:flex">
            <a href="#lineage">文脉</a>
            <a href="#framework">框架</a>
            <a href="#atlas">舆图</a>
            <a href="#corpus">语料</a>
            <a href="#knowledge">知识库</a>
            <a href="/research-assistant">问答</a>
            <a href="/news-agent">周报</a>
            <a href="/atlas">舆图</a>
          </div>
        </nav>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-8 pt-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-jade">Digital Humanities · Cultural Data Intelligence</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-tight md:text-7xl">天府学研究中心智能研究平台</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              面向地方学、历史学、新闻传播、文化遗产与数字人文研究者，构建文献、知识图谱、GIS 舆图、RAG 问答与研究 Agent 一体化工作台。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button>
                进入平台
                <ArrowRight className="h-4 w-4" />
              </Button>
              <a href="/corpus">
                <Button variant="outline">查看知识库</Button>
              </a>
              <a href="/research-assistant">
                <Button variant="outline">研究助手</Button>
              </a>
              <a href="/news-agent">
                <Button variant="outline">文化周报</Button>
              </a>
              <a href="/atlas">
                <Button variant="outline">进入天府文化研究舆图</Button>
              </a>
            </div>
          </div>

          <div className="grid gap-3">
            {entries.map((entry) => {
              const Icon = entry.icon;
              return (
                <a key={entry.title} href={entry.href} className="glass group rounded-lg p-5 transition hover:border-cyanline/50 hover:bg-cyanline/5">
                  <div className="flex items-start gap-4">
                    <div className="rounded-md border border-cyanline/20 bg-cyanline/10 p-3">
                      <Icon className="h-6 w-6 text-cyanline" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{entry.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{entry.desc}</p>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 mx-auto mt-14 grid max-w-7xl gap-3 md:grid-cols-5">
          {stats.map((stat) => (
            <div key={stat.label} className="glass rounded-lg p-4">
              <div className="text-2xl font-semibold text-cyanline">{stat.value}</div>
              <div className="mt-1 text-sm text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <LineagePanel />
      <FrameworkBuilder />
      <TianfuMap />
      <CorpusInfrastructure />

      <section id="knowledge" className="relative z-10 px-5 py-16 md:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm uppercase tracking-[0.3em] text-cyanline">Knowledge Base & Agents</p>
          <h2 className="mt-3 text-3xl font-semibold md:text-5xl">Tianfu Knowledge Base</h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <div className="glass rounded-lg p-6">
              <FileText className="h-7 w-7 text-cyanline" />
              <h3 className="mt-4 text-xl font-semibold">多源文档解析</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">支持 PDF、Word、TXT、Markdown、HTML、网页文章、公众号文章、地方志、古籍与学术论文导入。</p>
            </div>
            <div className="glass rounded-lg p-6">
              <Database className="h-7 w-7 text-jade" />
              <h3 className="mt-4 text-xl font-semibold">pgvector 向量知识库</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">BGE-M3 embedding、PostgreSQL 元数据、向量检索、去重、摘要、关键词与自动分类。</p>
            </div>
            <div className="glass rounded-lg p-6">
              <ShieldCheck className="h-7 w-7 text-amberdata" />
              <h3 className="mt-4 text-xl font-semibold">可溯源 RAG 问答</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">回答必须显示引用来源、出处与文献链接，对低置信度问题返回证据不足提示。</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
            {agents.map((agent) => {
              const Icon = agent.icon;
              return (
                <div key={agent.name} className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm">
                  <Icon className="mb-3 h-5 w-5 text-cyanline" />
                  {agent.name}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
