"use client";

import { useRef, useState } from "react";
import { FolderInput, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE, fetchJson } from "@/components/corpus/api";

type Props = {
  onImported: () => void;
};

export function FileUploadPanel({ onImported }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState("等待导入");
  const [busy, setBusy] = useState(false);

  async function uploadFile() {
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setStatus("请选择文件");
      return;
    }
    setBusy(true);
    setStatus("上传并解析中...");
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch(`${API_BASE}/api/ingestion/import-file`, { method: "POST", body });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      setStatus("文件导入完成");
      onImported();
    } catch (error) {
      setStatus(`导入失败：${error instanceof Error ? error.message : "unknown error"}`);
    } finally {
      setBusy(false);
    }
  }

  async function importDirectory() {
    setBusy(true);
    setStatus("扫描 imports 目录中...");
    try {
      const result = await fetchJson<{ discovered: number; imported: number }>("/api/ingestion/import-directory", { method: "POST" });
      setStatus(`发现 ${result.discovered} 个文件，完成 ${result.imported} 个导入`);
      onImported();
    } catch (error) {
      setStatus(`目录导入失败：${error instanceof Error ? error.message : "unknown error"}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass rounded-lg p-5">
      <div className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <Upload className="h-5 w-5 text-cyanline" />
        文件导入
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt,.md,.markdown,.html,.htm,.json,.csv"
        className="w-full rounded-md border border-white/10 bg-slate-950/70 p-2 text-sm"
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={uploadFile} disabled={busy}>
          <Upload className="h-4 w-4" />
          上传文件
        </Button>
        <Button variant="outline" onClick={importDirectory} disabled={busy}>
          <FolderInput className="h-4 w-4" />
          导入 imports
        </Button>
      </div>
      <p className="mt-3 text-sm text-slate-400">{status}</p>
    </div>
  );
}
