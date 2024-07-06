import {OpenAIStream, StreamingTextResponse} from "ai"
import OpenAI from "openai"
import {ChatCompletionMessageParam} from "openai/resources/chat"

import {
  OPENAI_API_HOST,
  OPENAI_API_TYPE,
  OPENAI_API_VERSION,
  OPENAI_AZURE_DEPLOYMENT_ID,
  OPENAI_ORGANIZATION
} from "../app/const"
import {Message} from "@/types/chat"
import {getAzureDeploymentIdForModelId} from "@/utils/app/azure"

export class OpenAIError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export class GenericOpenAIError extends OpenAIError {
  type: string
  param: string
  code: string

  constructor(message: string, type: string, param: string, code: string) {
    super(message)
    this.type = type
    this.param = param
    this.code = code
  }
}

export class OpenAIAuthError extends OpenAIError {
  constructor(message: string) {
    super(message)
  }
}

export class OpenAIRateLimited extends OpenAIError {
  retryAfterSeconds?: number

  constructor(message: string, retryAfterSeconds?: number) {
    super(message)
    this.retryAfterSeconds = retryAfterSeconds
  }
}

export class OpenAILimitExceeded extends OpenAIError {
  limit?: number
  requested?: number

  constructor(message: string, limit?: number, requested?: number) {
    super(message)
    this.limit = limit
    this.requested = requested
  }
}

function createOpenAiConfiguration(apiKey: string, modelId: string) {
  if (OPENAI_API_TYPE === "azure") {
    let config = {
      baseURL: `${OPENAI_API_HOST}/openai/deployments/${getAzureDeploymentIdForModelId(
        OPENAI_AZURE_DEPLOYMENT_ID,
        modelId
      )}`,
      apiKey: apiKey || process.env.OPENAI_API_KEY,
      defaultQuery: {
        "api-version": process.env.OPENAI_API_VERSION
      },
      defaultHeaders: {
        "api-key": apiKey || process.env.OPENAI_API_KEY
      }
    }
    return config
  } else {
    return {
      baseURL: `${OPENAI_API_HOST}/v1`,
      apiKey: apiKey || process.env.OPENAI_API_KEY,
      organization: OPENAI_ORGANIZATION
    }
  }
}

function createOpenAiClient(configuration: any) {
  return new OpenAI(configuration)
}

export const ChatCompletionStream = async (
  modelId: string,
  systemPrompt: string,
  temperature: number,
  maxTokens: number,
  apiKey: string,
  messages: Message[]
) => {
  const configuration = createOpenAiConfiguration(apiKey, modelId)
  const openai = createOpenAiClient(configuration)

  if (messages.length === 0) {
    throw new Error("No messages in history")
  }

  // Ask OpenAI for a streaming chat completion given the prompt
  try {
    const response = await openai.chat.completions.create({
      model: modelId,
      messages: [{role: "system", content: systemPrompt}, ...messages],
      max_tokens: maxTokens,
      temperature: temperature,
      stream: true
    })

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response)
    // Respond with the stream
    return new StreamingTextResponse(stream)
  } catch (error) {
    console.log(error)
    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        throw new OpenAIAuthError(error.message)
      }

      if (error.status === 429) {
        const match = error.message.match(/retry.* (\d+) sec/)
        const retryAfter = match ? parseInt(match[1]) : undefined
        throw new OpenAIRateLimited(error.message, retryAfter)
      }

      if (error.code && error.code === "context_length_exceeded") {
        const match = error.message.match(/max.*length.* (\d+) tokens.*requested (\d+) tokens/)
        const limit = match ? parseInt(match[1]) : undefined
        const requested = match ? parseInt(match[2]) : undefined

        throw new OpenAILimitExceeded(error.message, limit, requested)
      }

      if (error.type && error.code) {
        throw new GenericOpenAIError(error.message, error.type, "", error.code)
      }

      throw new Error(`${OPENAI_API_TYPE} returned an error: ${error.message}`)
    } else {
      throw new Error(`${OPENAI_API_TYPE} returned an error: ${error}`)
    }
  }
}
