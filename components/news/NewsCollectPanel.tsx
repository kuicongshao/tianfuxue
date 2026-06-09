"use client";

import { useState } from "react";
import { Link, Radio, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchJson } from "@/components/corpus/api";

type Props = {
  onDone: () => void;
};

export function NewsCollectPanel({ onDone }: Props) {
  const [keyword, setKeyword] = useState("三星堆");
  const [rssUrl, setRssUrl] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [status, setStatus] = useState("等待采集");
  const [busy, setBusy] = useState(false);

  async function collectKeyword() {
    setBusy(true);
    setStatus("关键词采集中...");
    try {
      const result = await fetchJson<{ imported?: number; duplicates?: number; status: string; error?: string }>("/api/news/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, limit: 10 })
      });
      setStatus(result.status === "failed" ? `采集失败：${result.error}` : `新增 ${result.imported || 0} 条，重复 ${result.duplicates || 0} 条`);
      onDone();
    } catch (error) {
      setStatus(`采集失败：${error instanceof Error ? error.message : "unknown error"}`);
    } finally {
      setBusy(false);
    }
  }

  async function collectRss() {
    setBusy(true);
    setStatus("RSS 采集中...");
    try {
      const result = await fetchJson<{ imported?: number; duplicates?: number; status: string; error?: string }>("/api/news/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rss_url: rssUrl, limit: 20 })
      });
      setStatus(result.status === "failed" ? `RSS 失败：${result.error}` : `RSS 新增 ${result.imported || 0} 条`);
      onDone();
    } catch (error) {
      setStatus(`RSS 失败：${error instanceof Error ? error.message : "unknown error"}`);
    } finally {
      setBusy(false);
    }
  }

  async function collectUrl() {
    setBusy(true);
    setStatus("链接解析中...");
    try {
      const result = await fetchJson<{ status: string; error?: string }>("/api/news/collect-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: manualUrl })
      });
      setStatus(result.status === "failed" ? `链接失败：${result.error}` : `链接状态：${result.status}`);
      onDone();
    } catch (error) {
      setStatus(`链接失败：${error instanceof Error ? error.message : "unknown error"}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass rounded-lg p-5">
      <h2 className="text-lg font-semibold">新闻采集</h2>
      <div className="mt-4 grid gap-3">
        <div className="flex gap-2">
          <input value={keyword} onChange={(event) => setKeyword(event.target.value)} className="h-10 flex-1 rounded-md border border-white/12 bg-slate-950/70 px-3 text-sm" />
          <Button onClick={collectKeyword} disabled={busy}>
            <Search className="h-4 w-4" />
            关键词
          </Button>
        </div>
        <div className="flex gap-2">
          <input value={rssUrl} onChange={(event) => setRssUrl(event.target.value)} placeholder="RSS URL" className="h-10 flex-1 rounded-md border border-white/12 bg-slate-950/70 px-3 text-sm" />
          <Button variant="outline" onClick={collectRss} disabled={busy || !rssUrl}>
            <Radio className="h-4 w-4" />
            RSS
          </Button>
        </div>
        <div className="flex gap-2">
          <input value={manualUrl} onChange={(event) => setManualUrl(event.target.value)} placeholder="公开新闻链接" className="h-10 flex-1 rounded-md border border-white/12 bg-slate-950/70 px-3 text-sm" />
          <Button variant="outline" onClick={collectUrl} disabled={busy || !manualUrl}>
            <Link className="h-4 w-4" />
            链接
          </Button>
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-400">{status}</p>
    </div>
  );
}
