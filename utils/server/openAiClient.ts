import {Message} from "@/types/chat"
import {OpenAIModelID} from "@/types/openai"
import {
  OPENAI_API_HOST,
  OPENAI_API_MAX_TOKENS,
  OPENAI_API_TYPE,
  OPENAI_API_VERSION,
  OPENAI_AZURE_DEPLOYMENT_ID,
  OPENAI_ORGANIZATION
} from "../app/const"
import {OpenAIStream, StreamingTextResponse} from "ai"
import {Configuration, OpenAIApi} from "openai-edge"

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

function createOpenaiConfiguration(apiKey: string) {
  if (OPENAI_API_TYPE === "azure") {
    let config = new Configuration({
      basePath: `${OPENAI_API_HOST}/openai/deployments/${OPENAI_AZURE_DEPLOYMENT_ID}`,
      defaultQueryParams: new URLSearchParams({
        "api-version": OPENAI_API_VERSION
      }),
      baseOptions: {
        headers: {
          "api-key": apiKey ? apiKey : process.env.OPENAI_API_KEY
        }
      }
    })
    //hack to remove OpenAI authorization header
    delete config.baseOptions.headers["Authorization"]
    return config
  } else {
    return new Configuration({
      basePath: `${OPENAI_API_HOST}/v1`,
      apiKey: apiKey ? apiKey : process.env.OPENAI_API_KEY,
      organization: OPENAI_ORGANIZATION
    })
  }
}

function createOpenAiClient(configuration: Configuration) {
  return new OpenAIApi(configuration)
}

export const ChatCompletionStream = async (
  modelId: OpenAIModelID,
  systemPrompt: string,
  temperature: number,
  apiKey: string,
  messages: Message[]
) => {
  const configuration = createOpenaiConfiguration(apiKey)
  const openai = createOpenAiClient(configuration)

  if (messages.length === 0) {
    throw new Error("No messages in history")
  }

  // Ask OpenAI for a streaming chat completion given the prompt
  const response = await openai.createChatCompletion({
    model: modelId,
    messages: [{role: "system", content: systemPrompt}, ...messages],
    max_tokens: OPENAI_API_MAX_TOKENS,
    temperature: temperature,
    stream: true
  })

  const decoder = new TextDecoder()

  // HTTP POST error handling
  if (response.status !== 200) {
    const result = await response.json()
    if (response.status === 401) {
      if (result.error) {
        throw new OpenAIAuthError(result.error.message)
      }

      throw new OpenAIAuthError(result.message)
    }

    if (response.status === 429 && result.error) {
      const match = result.error.message.match(/retry after (\d+) seconds/)
      const retryAfter = match ? parseInt(match[1]) : undefined
      throw new OpenAIRateLimited(result.error.message, retryAfter)
    }

    if (result.error && result.error.code === "context_length_exceeded") {
      const match = result.error.message.match(
        /maximum context length is (\d+) tokens. However, you requested (\d+) tokens/
      )
      const limit = match ? parseInt(match[1]) : undefined
      const requested = match ? parseInt(match[2]) : undefined

      throw new OpenAILimitExceeded(result.error.message, limit, requested)
    }

    if (result.error) {
      console.error("GenericOpenAIError", result)
      throw new GenericOpenAIError(result.error.message, result.error.type, result.error.param, result.error.code)
    }

    throw new Error(`${OPENAI_API_TYPE} returned an error: ${decoder.decode(result?.value) || result.statusText}`)
  }

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response)
  // Respond with the stream
  return new StreamingTextResponse(stream)
}
