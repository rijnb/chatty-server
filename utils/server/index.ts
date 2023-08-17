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
  type: string
  param: string
  code: string

  constructor(message: string, type: string, param: string, code: string) {
    super(message)
    this.name = "OpenAIError"
    this.type = type
    this.param = param
    this.code = code
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
    if (result.error) {
      throw new OpenAIError(result.error.message, result.error.type, result.error.param, result.error.code)
    } else {
      throw new Error(`${OPENAI_API_TYPE} returned an error: ${decoder.decode(result?.value) || result.statusText}`)
    }
  }

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response)
  // Respond with the stream
  return new StreamingTextResponse(stream)
}
