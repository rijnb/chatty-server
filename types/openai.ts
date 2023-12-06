/**
 * This file contains additional information about supported models.
 * Most importantly, it defines the maximum number of tokens.
 *
 * Note that this should match your deployment of OpenAI models.
 * Currently, we cannot query the API for this information.
 */

export interface OpenAIModel {
  id: OpenAIModelID
  name: string
  tokenLimit: number
}

export enum OpenAIModelID {
  GPT_3_5_TURBO = "gpt-3.5-turbo",
  GPT_35_TURBO = "gpt-35-turbo",
  GPT_3_5_TURBO_16K = "gpt-3.5-turbo-16k",
  GPT_35_TURBO_16K = "gpt-35-turbo-16k",
  GPT_4 = "gpt-4",
  GPT_4_32K = "gpt-4-32k"
}

export const OpenAIModels: Record<OpenAIModelID, OpenAIModel> = {
  [OpenAIModelID.GPT_3_5_TURBO]: {
    id: OpenAIModelID.GPT_3_5_TURBO,
    name: OpenAIModelID.GPT_3_5_TURBO,
    tokenLimit: 4 * 1024
  },
  [OpenAIModelID.GPT_35_TURBO]: {
    id: OpenAIModelID.GPT_35_TURBO,
    name: OpenAIModelID.GPT_35_TURBO,
    tokenLimit: 4 * 1024
  },
  [OpenAIModelID.GPT_3_5_TURBO_16K]: {
    id: OpenAIModelID.GPT_3_5_TURBO_16K,
    name: OpenAIModelID.GPT_3_5_TURBO_16K,
    tokenLimit: 16 * 1024
  },
  [OpenAIModelID.GPT_35_TURBO_16K]: {
    id: OpenAIModelID.GPT_35_TURBO_16K,
    name: OpenAIModelID.GPT_35_TURBO_16K,
    tokenLimit: 16 * 1024
  },
  [OpenAIModelID.GPT_4]: {
    id: OpenAIModelID.GPT_4,
    name: OpenAIModelID.GPT_4,
    tokenLimit: 128 * 1024
  },
  [OpenAIModelID.GPT_4_32K]: {
    id: OpenAIModelID.GPT_4_32K,
    name: OpenAIModelID.GPT_4_32K,
    tokenLimit: 32 * 1024
  }
}

// In case the `OPENAI_DEFAULT_MODEL` environment variable is not set or set to an unsupported model.
export const FALLBACK_OPENAI_MODEL_ID = OpenAIModelID.GPT_4_32K
