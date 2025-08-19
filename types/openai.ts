/*
 * Copyright (C) 2024, Rijn Buve.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions
 * of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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
  outputTokenLimit: number // The maximum number of output tokens for this model; if 0, the model is not supported.
  openAIReasoningModel?: boolean // Indicates if the model is an OpenAI reasoning model like o1 or o3-mini.
}

const K1 = 1000
const K4 = 4 * K1
const K16 = 16 * K1
const K32 = 32 * K1
const K100 = 100 * K1
const K128 = 128 * K1
const K200 = 200 * K1
const K400 = 400 * K1

export const OpenAIModels: Record<string, OpenAIModel> = {
  ["gpt-3.5-turbo"]: {id: "gpt-3.5-turbo", inputTokenLimit: K16, outputTokenLimit: K4},
  ["gpt-3.5-turbo-16k"]: {id: "gpt-3.5-turbo-16k", inputTokenLimit: K16, outputTokenLimit: K16},
  ["gpt-35-turbo"]: {id: "gpt-35-turbo", inputTokenLimit: K16, outputTokenLimit: K4},
  ["gpt-35-turbo-16k"]: {id: "gpt-35-turbo-16k", inputTokenLimit: K16, outputTokenLimit: K16},
  ["gpt-4"]: {id: "gpt-4", inputTokenLimit: K128, outputTokenLimit: K4},
  ["gpt-4-32k"]: {id: "gpt-4-32k", inputTokenLimit: K32, outputTokenLimit: K32},
  ["gpt-4-turbo-preview"]: {id: "gpt-4-turbo-preview", inputTokenLimit: K128, outputTokenLimit: K4},
  ["gpt-4-turbo"]: {id: "gpt-4-turbo", inputTokenLimit: K128, outputTokenLimit: K4},
  ["gpt-4o"]: {id: "gpt-4o", inputTokenLimit: K128, outputTokenLimit: K4},
  ["gpt-4o-mini"]: {id: "gpt-4o-mini", inputTokenLimit: K128, outputTokenLimit: K16},
  ["o3-mini"]: {id: "o3-mini", inputTokenLimit: K128, outputTokenLimit: K32, openAIReasoningModel: true},
  ["o3-pro"]: {id: "o3-pro", inputTokenLimit: K200, outputTokenLimit: K100, openAIReasoningModel: true},
  ["o4-mini"]: {id: "o4-mini", inputTokenLimit: K200, outputTokenLimit: K100, openAIReasoningModel: true},
  ["codex-mini"]: {id: "codex-mini", inputTokenLimit: K200, outputTokenLimit: K100, openAIReasoningModel: true},
  ["gpt-5"]: {id: "gpt-5", inputTokenLimit: K400, outputTokenLimit: K128, openAIReasoningModel: true},
  ["gpt-5-chat"]: {id: "gpt-5-chat", inputTokenLimit: K400, outputTokenLimit: K128, openAIReasoningModel: true},
  ["gpt-5-mini"]: {id: "gpt-5-mini", inputTokenLimit: K400, outputTokenLimit: K128, openAIReasoningModel: true},
  ["gpt-5-nano"]: {id: "gpt-5-nano", inputTokenLimit: K400, outputTokenLimit: K128, openAIReasoningModel: true}
}

const normalizeModelId = (modelId: string): string => {
  // Strip a trailing date suffix like -YYYY-MM-DD (e.g., gpt-5-nano-2025-02-02 -> gpt-5-nano).
  // For now, we won't do this, because it seems dated models are not always well supported.
  // Code to nowmalize: return modelId.replace(/-\d{4}-\d{2}-\d{2}$/i, "")
  return modelId
}

export const maxInputTokensForModel = (modelId: string) => {
  const baseId = normalizeModelId(modelId)
  return OpenAIModels.hasOwnProperty(baseId) ? OpenAIModels[baseId]?.inputTokenLimit ?? 0 : 0
}

export const maxOutputTokensForModel = (modelId: string) => {
  const baseId = normalizeModelId(modelId)
  return OpenAIModels.hasOwnProperty(baseId) ? OpenAIModels[baseId]?.outputTokenLimit ?? 0 : 0
}

export const isOpenAIReasoningModel = (modelId: string) => {
  const baseId = normalizeModelId(modelId)
  return OpenAIModels.hasOwnProperty(baseId) ? OpenAIModels[baseId]?.openAIReasoningModel ?? false : false
}

export const FALLBACK_OPENAI_MODEL = "gpt-5-nano"
