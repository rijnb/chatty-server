import {NextApiResponse} from "next"
import OpenAI from "openai"
import {RunnableToolFunctionWithParse} from "openai/lib/RunnableFunction"

import {OPENAI_API_HOST, OPENAI_API_KEY, OPENAI_AZURE_DEPLOYMENT_ID} from "../app/const"
import {Message} from "@/types/chat"
import {getAzureDeploymentIdForModelId} from "@/utils/app/azure"
import {ToolId, ToolsRegistry} from "@/utils/server/tools"

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

export const ChatCompletionStream = async (
  modelId: string,
  systemPrompt: string,
  temperature: number,
  maxTokens: number,
  apiKey: string,
  selectedTools: ToolId[],
  toolUserConfigurations: Record<string, any>,
  messages: Message[]
) => {
  // TODO handle modelId for OpenAI
  // TODO handle organization for OpenAI

  const openai = new OpenAI({
    baseURL: `${OPENAI_API_HOST}/openai/deployments/${getAzureDeploymentIdForModelId(
      OPENAI_AZURE_DEPLOYMENT_ID,
      modelId
    )}`,
    defaultQuery: {"api-version": "2024-02-15-preview"},
    defaultHeaders: {"api-key": apiKey || OPENAI_API_KEY}
  })

  if (messages.length === 0) {
    throw new Error("No messages in history")
  }

  const toolsToUse: RunnableToolFunctionWithParse<any>[] = ToolsRegistry.filter((tool) =>
    selectedTools.includes(tool.id)
  )
    .filter((tool) => tool.hasConfiguration() || toolUserConfigurations[tool.id])
    .map((tool) => {
      const configuration = tool.hasConfiguration() ? tool.getConfiguration() : toolUserConfigurations[tool.id]
      return {
        type: "function",
        function: {
          name: tool.id,
          description: tool.description,
          parameters: tool.parameters,
          parse: JSON.parse,
          function: (args) => tool.execute(configuration, args)
        }
      }
    })

  console.info(
    "toolsToUse",
    toolsToUse.map((t) => t.function.name)
  )

  // Ask OpenAI for a streaming chat completion given the prompt
  console.info(`config: url:${OPENAI_API_HOST}, model:${modelId}`)

  const stream = openai.beta.chat.completions
    .runTools({
      model: "gpt-3.5-turbo",
      messages: [{role: "system", content: systemPrompt}, ...messages.map((m) => ({role: m.role, content: m.content}))],
      max_tokens: maxTokens,
      temperature: temperature,
      stream: true,
      tools: toolsToUse
    })
    .on("connect", () => console.info("connect"))
    .on("functionCall", (call) => console.info(`functionCall: ${JSON.stringify(call)}`))
    .on("message", (msg) => console.info(`message: ${JSON.stringify(msg)}`))
    .on("chatCompletion", (completion) => console.info(`chatCompletion: ${JSON.stringify(completion)}`))
    .on("finalContent", (contentSnapshot) => console.info(`finalContent: ${JSON.stringify(contentSnapshot)}`))
    .on("finalMessage", (message) => console.info(`finalMessage: ${JSON.stringify(message)}`))
    .on("finalChatCompletion", (completion) => console.info(`finalChatCompletion: ${JSON.stringify(completion)}`))
    .on("finalFunctionCall", (call) => console.info(`finalFunctionCall: ${JSON.stringify(call)}`))
    .on("functionCallResult", (result) => console.info(`functionCallResult: ${JSON.stringify(result)}`))
    .on("finalFunctionCallResult", (result) => console.info(`finalFunctionCallResult: ${JSON.stringify(result)}`))
    .on("error", (error) => {
      console.error(`error: ${JSON.stringify(error)}`)
    })
    .on("abort", () => console.info("abort"))
    .on("end", () => console.info("end"))
    .on("totalUsage", (usage) => console.info(`totalUsage: ${JSON.stringify(usage)}`))
  // .on("chunk", (chunk) => console.info(`chunk: ${JSON.stringify(chunk)}`))
  // .on("content", (content) => console.info(`content: ${JSON.stringify(content)}`))

  console.info("stream.toReadableStream()")

  return stream.toReadableStream()

  // const decoder = new TextDecoder()
  //
  // // HTTP POST error handling
  // if (response.status !== 200) {
  //   const result = await response.json()
  //   if (response.status === 401) {
  //     if (result.error) {
  //       throw new OpenAIAuthError(result.error.message)
  //     }
  //
  //     throw new OpenAIAuthError(result.message)
  //   }
  //
  //   if (response.status === 429 && result.error) {
  //     const match = result.error.message.match(/retry.* (\d+) sec/)
  //     const retryAfter = match ? parseInt(match[1]) : undefined
  //     throw new OpenAIRateLimited(result.error.message, retryAfter)
  //   }
  //
  //   if (result.error && result.error.code === "context_length_exceeded") {
  //     const match = result.error.message.match(/max.*length.* (\d+) tokens.*requested (\d+) tokens/)
  //     const limit = match ? parseInt(match[1]) : undefined
  //     const requested = match ? parseInt(match[2]) : undefined
  //
  //     throw new OpenAILimitExceeded(result.error.message, limit, requested)
  //   }
  //
  //   if (result.error) {
  //     console.error("GenericOpenAIError", result)
  //     throw new GenericOpenAIError(result.error.message, result.error.type, result.error.param, result.error.code)
  //   }
  //
  //   throw new Error(`${OPENAI_API_TYPE} returned an error: ${decoder.decode(result?.value) || result.statusText}`)
  // }
  //
  // // Convert the response into a friendly text-stream
  // const stream = OpenAIStream(response)
  // // Respond with the stream
  // return new StreamingTextResponse(stream)
}

export function streamToResponse(stream: ReadableStream, response: NextApiResponse) {
  const reader = stream.getReader()

  function read() {
    reader.read().then(({done, value}: {done: boolean; value?: any}) => {
      if (done) {
        response.end()
        return
      }
      response.write(value)
      read()
    })
  }

  read()
}
