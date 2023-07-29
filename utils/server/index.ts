import {Message} from "@/types/chat"
import {OpenAIModel} from "@/types/openai"

import {
  MSG_CHARS_PRIVACY_LIMIT,
  OPENAI_API_HOST,
  OPENAI_API_MAX_TOKENS,
  OPENAI_API_TYPE,
  OPENAI_API_VERSION,
  OPENAI_AZURE_DEPLOYMENT_ID,
  OPENAI_ORGANIZATION
} from "../app/const"

import {ParsedEvent, ReconnectInterval, createParser} from "eventsource-parser"


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

export const OpenAIStream = async (
  model: OpenAIModel,
  systemPrompt: string,
  temperature: number,
  apiKey: string,
  messages: Message[]
) => {
  // OpenAI URL.
  let url = `${OPENAI_API_HOST}/v1/chat/completions`
  if (OPENAI_API_TYPE === "azure") {
    // Azure URL.
    url = `${OPENAI_API_HOST}/openai/deployments/${OPENAI_AZURE_DEPLOYMENT_ID}/chat/completions?api-version=${OPENAI_API_VERSION}`
  }

  console.info(`Input '${messages[messages.length - 1].content.substring(0, MSG_CHARS_PRIVACY_LIMIT)}...'`)
  console.info(`  HTTP POST ${url}`)
  console.info(
    `  {model:'${model.id}', max_tokens:${OPENAI_API_MAX_TOKENS}, temperature:${temperature}, messages:[#${
      messages.length
    }, ${messages[messages.length - 1].role}, ${messages[messages.length - 1].content.length} chars (limit is ${
      model.tokenLimit
    } tokens)]}`
  )

  // HTTP POST full context to OpenAI.
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(OPENAI_API_TYPE === "openai" && {
        Authorization: `Bearer ${apiKey ? apiKey : process.env.OPENAI_API_KEY}`
      }),
      ...(OPENAI_API_TYPE === "openai" &&
        OPENAI_ORGANIZATION && {
          "OpenAI-Organization": OPENAI_ORGANIZATION
        }),
      ...(OPENAI_API_TYPE === "azure" && {
        "api-key": `${apiKey ? apiKey : process.env.OPENAI_API_KEY}`
      })
    },
    method: "POST",
    body: JSON.stringify({
      ...(OPENAI_API_TYPE === "openai" && {model: model.id}),
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        ...messages
      ],
      max_tokens: OPENAI_API_MAX_TOKENS,
      temperature: temperature,
      stream: true
    })
  })
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  if (response.status !== 200) {
    const result = await response.json()
    if (result.error) {
      throw new OpenAIError(result.error.message, result.error.type, result.error.param, result.error.code)
    } else {
      throw new Error(`${OPENAI_API_TYPE} returned an error: ${decoder.decode(result?.value) || result.statusText}`)
    }
  }

  return new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === "event") {
          const data = event.data

          try {
            const json = JSON.parse(data)
            if (json.choices[0].finish_reason != null) {
              controller.close()
              return
            }
            const text = json.choices[0].delta.content
            const queue = encoder.encode(text)
            controller.enqueue(queue)
          } catch (e) {
            controller.error(e)
          }
        }
      }

      const parser = createParser(onParse)

      for await (const chunk of response.body as any) {
        parser.feed(decoder.decode(chunk))
      }
    }
  })
}