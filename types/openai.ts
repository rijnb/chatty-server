/**
 * This file contains additional information about supported models.
 * Most importantly, it defines the maximum number of tokens.
 *
 * Note that this should match your deployment of OpenAI models.
 * Currently, we cannot query the API for this information.
 */

export interface OpenAIModel {
  id: string // The model identifier.
  inputTokenLimit: number // The maximum number of input tokens for this model; if 0, the model is not supported.
  outputTokenLimit: number // The maximum number of input tokens for this model; if 0, the model is not supported.
}

const K4 = 4 * 1024
const K16 = 16 * 1024
const K32 = 32 * 1024
const K128 = 128 * 1024

export const OpenAIModels: Record<string, OpenAIModel> = {
  ["gpt-3.5-turbo"]: { id: "gpt-3.5-turbo", inputTokenLimit: K16, outputTokenLimit: K4 },
  ["gpt-3.5-turbo-16k"]: { id: "gpt-3.5-turbo-16k", inputTokenLimit: K16, outputTokenLimit: K16 },
  ["gpt-35-turbo"]: { id: "gpt-35-turbo", inputTokenLimit: K16, outputTokenLimit: K4 },
  ["gpt-35-turbo-16k"]: { id: "gpt-35-turbo-16k", inputTokenLimit: K16, outputTokenLimit: K16 },
  ["gpt-4"]: { id: "gpt-4", inputTokenLimit: K128, outputTokenLimit: K4 },
  ["gpt-4-32k"]: { id: "gpt-4-32k", inputTokenLimit: K32, outputTokenLimit: K32 },
  ["gpt-4-turbo-preview"]: { id: "gpt-4-turbo-preview", inputTokenLimit: K128, outputTokenLimit: K4 },
  ["gpt-4-turbo"]: { id: "gpt-4-turbo", inputTokenLimit: K128, outputTokenLimit: K4 },
  ["gpt-4o"]: { id: "gpt-4o", inputTokenLimit: K128, outputTokenLimit: K4 }
}

export const maxInputTokensForModel = (modelId: string) => {
  return OpenAIModels[modelId]?.inputTokenLimit ?? 0
}

export const maxOutputTokensForModel = (modelId: string) => {
  return OpenAIModels[modelId]?.outputTokenLimit ?? 0
}

export const FALLBACK_OPENAI_MODEL = "gpt-35-turbo"