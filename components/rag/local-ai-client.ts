import type { LocalAIAnswer, LocalAIConfig, LocalAIConnection } from "@/components/rag/local-ai-types";

const SYSTEM_PROMPT = `你是“天府学研究助手”，仅依据提供的天府学数字文献检索资料回答。
规则：不得虚构作者、文献、年份、历史事实或引用；资料不足时明确说明“当前知识库资料不足”；语言应学术、结构清晰、准确；优先解释概念关系、历史背景、研究争议和可继续研究方向；只在有依据的表述后使用 [1]、[2] 等引用编号；不得声称访问了未提供的外部数据库。`;

export function normalizeLocalBaseUrl(baseUrl: string) {
  return baseUrl.trim().replace(/\/+$/, "");
}

export function loadLocalAIConfig(): LocalAIConfig | null {
  try {
    const stored = window.localStorage.getItem("tianfu_local_ai_config_v1");
    return stored ? (JSON.parse(stored) as LocalAIConfig) : null;
  } catch {
    return null;
  }
}

export function saveLocalAIConfig(config: LocalAIConfig) {
  window.localStorage.setItem("tianfu_local_ai_config_v1", JSON.stringify(config));
}

export function clearLocalAIConfig() {
  window.localStorage.removeItem("tianfu_local_ai_config_v1");
}

export async function testLocalAIConnection(config: LocalAIConfig): Promise<LocalAIConnection> {
  const url = config.provider === "ollama" ? `${normalizeLocalBaseUrl(config.baseUrl)}/api/tags` : `${normalizeLocalBaseUrl(config.baseUrl)}/models`;
  const payload = await requestJson(url, { method: "GET", headers: authHeaders(config) }, config.timeoutSeconds);
  const models = config.provider === "ollama" ? readOllamaModels(payload) : readOpenAIModels(payload);
  return { models };
}

export async function generateWithLocalAI(config: LocalAIConfig, question: string, context: string): Promise<LocalAIAnswer> {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: `研究问题：\n${question}\n\n检索模式：\nhybrid-lite\n\n知识库检索资料：\n${context}\n\n请基于以上材料回答，并在相关表述后标注引用编号。` }
  ];
  const baseUrl = normalizeLocalBaseUrl(config.baseUrl);
  const payload = config.provider === "ollama"
    ? await requestJson(`${baseUrl}/api/chat`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders(config) }, body: JSON.stringify({ model: config.model, messages, stream: false, options: { temperature: config.temperature } }) }, config.timeoutSeconds)
    : await requestJson(`${baseUrl}/chat/completions`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders(config) }, body: JSON.stringify({ model: config.model, messages, temperature: config.temperature, max_tokens: config.maxTokens, stream: false }) }, config.timeoutSeconds);
  const answer = config.provider === "ollama" ? payload?.message?.content : payload?.choices?.[0]?.message?.content;
  if (typeof answer !== "string" || !answer.trim()) throw new Error("invalid_response");
  return { answer: answer.trim(), model: config.model };
}

function authHeaders(config: LocalAIConfig): Record<string, string> {
  return config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {};
}

async function requestJson(url: string, init: RequestInit, timeoutSeconds: number) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), Math.max(1, timeoutSeconds) * 1000);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const body = await response.text();
    let payload: unknown;
    try { payload = JSON.parse(body); } catch { throw new Error(body.trimStart().startsWith("<") ? "html_response" : "invalid_response"); }
    if (!response.ok) throw new Error(`http_${response.status}`);
    return payload as any;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw new Error("timeout");
    throw error;
  } finally {
    window.clearTimeout(timer);
  }
}

function readOllamaModels(payload: any) {
  return Array.isArray(payload?.models) ? payload.models.map((item: any) => item?.name).filter((name: unknown): name is string => typeof name === "string") : [];
}

function readOpenAIModels(payload: any) {
  return Array.isArray(payload?.data) ? payload.data.map((item: any) => item?.id).filter((id: unknown): id is string => typeof id === "string") : [];
}

export function localAIErrorMessage(error: unknown) {
  const code = error instanceof Error ? error.message : "";
  if (code === "timeout") return "请求超过设定时限，已自动取消。";
  if (code === "model_missing") return "未填写本地模型名称，请在配置面板中选择或手动输入模型名。";
  if (code === "html_response" || code === "invalid_response") return "本地模型返回了无法解析的响应，请检查服务地址和接口类型。";
  if (code === "http_404") return "未找到指定模型或接口，请检查模型名称和服务地址。";
  if (code.startsWith("http_")) return "本地模型服务拒绝了请求，请检查模型、API Key 和服务配置。";
  return "无法连接本地模型服务，请确认服务已启动，并检查 CORS、防火墙和本地端口。";
}
