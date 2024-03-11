/**
 * This file contains additional information about supported models.
 * Most importantly, it defines the maximum number of tokens.
 *
 * Note that this should match your deployment of OpenAI models.
 * Currently, we cannot query the API for this information.
 */

export interface OpenAIModel {
  id: string // The model identifier.
  tokenLimit: number // The maximum number of tokens for this model; if 0, the model is not supported.
}

export const OpenAIModels: Record<string, OpenAIModel> = {
  ["gpt-3.5-turbo"]: {id: "gpt-3.5-turbo", tokenLimit: 16 * 1024},
  ["gpt-3.5-turbo-16k"]: {id: "gpt-3.5-turbo-16k", tokenLimit: 126 * 1024},
  ["gpt-35-turbo"]: {id: "gpt-35-turbo", tokenLimit: 16 * 1024},
  ["gpt-35-turbo-16k"]: {id: "gpt-35-turbo-16k", tokenLimit: 16 * 1024},
  ["gpt-4"]: {id: "gpt-4", tokenLimit: 128 * 1024},
  ["gpt-4-32k"]: {id: "gpt-4-32k", tokenLimit: 32 * 1024},
  ["gpt-4-turbo-preview"]: {id: "gpt-4-turbo-preview", tokenLimit: 128 * 1024}
}

export const maxTokensForModel = (modelId: string) => {
  return OpenAIModels[modelId]?.tokenLimit ?? 0
}

export const FALLBACK_OPENAI_MODEL = "gpt-35-turbo"
