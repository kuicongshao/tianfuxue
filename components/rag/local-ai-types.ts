export type LocalAIProvider = "ollama" | "openai-compatible";

export interface LocalAIConfig {
  enabled: boolean;
  provider: LocalAIProvider;
  baseUrl: string;
  model: string;
  apiKey?: string;
  temperature: number;
  maxTokens: number;
  timeoutSeconds: number;
  maxContextChunks: number;
}

export interface LocalAIConnection {
  models: string[];
}

export interface LocalAIAnswer {
  answer: string;
  model: string;
}

export type LocalAIStatus = "unconfigured" | "checking" | "connected" | "failed";

export const LOCAL_AI_STORAGE_KEY = "tianfu_local_ai_config_v1";

export const defaultLocalAIConfig = (): LocalAIConfig => ({
  enabled: false,
  provider: "ollama",
  baseUrl: "http://127.0.0.1:11434",
  model: "",
  apiKey: "",
  temperature: 0.3,
  maxTokens: 1200,
  timeoutSeconds: 60,
  maxContextChunks: 5
});
