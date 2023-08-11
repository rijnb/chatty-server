import {trimForPrivacy} from "@/utils/app/privacy"
import getNrOfTokens from "@/utils/app/tokens"
import {Message} from "@/types/chat"
import {OpenAIModel} from "@/types/openai"
import {
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
  let url = `${OPENAI_API_HOST}/v1/chat/completions`
  if (OPENAI_API_TYPE === "azure") {
    url = `${OPENAI_API_HOST}/openai/deployments/${OPENAI_AZURE_DEPLOYMENT_ID}/chat/completions?api-version=${OPENAI_API_VERSION}`
  }

  if (messages.length === 0) {
    throw new Error("No messages in history")
  }

  // HTTP POST full context to OpenAI.
  const headers = {
    "Content-Type": "application/json",

    // OpenAI headers.
    ...(OPENAI_API_TYPE === "openai" && {
      Authorization: `Bearer ${apiKey ? apiKey : process.env.OPENAI_API_KEY}`
    }),
    ...(OPENAI_API_TYPE === "openai" &&
      OPENAI_ORGANIZATION && {
        "OpenAI-Organization": OPENAI_ORGANIZATION
      }),

    // Azure headers.
    ...(OPENAI_API_TYPE === "azure" && {
      "api-key": `${apiKey ? apiKey : process.env.OPENAI_API_KEY}`
    })
  }
  const body = JSON.stringify({
    model: model.id,
    messages: [{role: "system", content: systemPrompt}, ...messages],
    max_tokens: OPENAI_API_MAX_TOKENS,
    temperature: temperature,
    stream: true
  })

  // Log prompt for debugging.
  const latestMessage = messages[messages.length - 1]
  const nrOfTokens = 1//!! getNrOfTokens(latestMessage.content, messages, systemPrompt, model)
  console.info(`sendRequest: {\
lastMessage:'${trimForPrivacy(latestMessage.content)}', \
lastMessageLengthInChars:${latestMessage.content.length}, \
bodyLengthInChars:${body.length}, \
nrOfMessages:${messages.length}, \
nrOfTokens:${nrOfTokens}, \
tokenLimit:${model.tokenLimit}, \
role:'${latestMessage.role}', \
model:'${model.id}', \
temperature:${temperature}, \
url:'${url}'`)

  const response = await fetch(url, {
    headers: headers,
    method: "POST",
    body: body
  })
  const encoder = new TextEncoder()
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

  // Read stream from OpenAI.
  return new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === "event") {
          const data = event.data

          // Read next event.
          try {
            const json = JSON.parse(data)

            // If it's the last message, close the stream.
            if (json.choices[0].finish_reason != null) {
              controller.close()
              return
            }

            // Otherwise, send the message to the controller.
            const text = json.choices[0].delta.content
            const queue = encoder.encode(text)
            controller.enqueue(queue)
          } catch (e) {
            controller.error(e)
            // Do not rethrow. The stream will be closed.
          }
        }
      }

      // Create the parser with the callback.
      const parser = createParser(onParse)
      for await (const chunk of response.body as any) {
        parser.feed(decoder.decode(chunk))
      }
    }
  })
}