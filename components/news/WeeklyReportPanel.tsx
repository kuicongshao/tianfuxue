"use client";

import { Download, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchJson } from "@/components/corpus/api";

type Report = {
  title: string;
  summary: string;
  report_markdown: string;
  news_count: number;
};

export function WeeklyReportPanel({ report, onGenerated }: { report?: Report | null; onGenerated: () => void }) {
  async function generate() {
    await fetchJson("/api/news/generate-weekly-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });
    onGenerated();
  }

  function downloadMarkdown() {
    if (!report?.report_markdown) return;
    const blob = new Blob([report.report_markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "sichuan-culture-weekly-report.md";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="glass rounded-lg p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Newspaper className="h-5 w-5 text-cyanline" />
          四川文化新闻周报
        </h2>
        <div className="flex gap-2">
          <Button onClick={generate}>生成周报</Button>
          <Button variant="outline" onClick={downloadMarkdown} disabled={!report?.report_markdown}>
            <Download className="h-4 w-4" />
            Markdown
          </Button>
        </div>
      </div>
      <div className="mt-4 max-h-[560px] overflow-auto whitespace-pre-wrap rounded-md border border-white/10 bg-slate-950/60 p-4 text-sm leading-7 text-slate-300">
        {report?.report_markdown || "尚未生成周报。"}
      </div>
    </div>
  );
}
