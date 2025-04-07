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
  id: string; // The model identifier.
  inputTokenLimit: number; // The maximum number of input tokens for this model; if 0, the model is not supported.
  outputTokenLimit: number; // The maximum number of output tokens for this model; if 0, the model is not supported.
  openAiReasoningModel?: boolean; // Indicates if the model is an OpenAI reasoning model like o1 or o3-mini
}

const K4 = 4 * 1024
const K16 = 16 * 1024
const K32 = 32 * 1024
const K128 = 128 * 1024

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
  ["o3-mini"]: {id: "o3-mini", inputTokenLimit: K128, outputTokenLimit: K32, openAiReasoningModel: true}
}

export const maxInputTokensForModel = (modelId: string) => {
  return OpenAIModels[modelId]?.inputTokenLimit ?? 0
}

export const maxOutputTokensForModel = (modelId: string) => {
  return OpenAIModels[modelId]?.outputTokenLimit ?? 0
}

export const isOpenAiReasoningModel = (modelId: string) => {
  return OpenAIModels[modelId]?.openAiReasoningModel ?? false
}

export const FALLBACK_OPENAI_MODEL = "gpt-35-turbo"
