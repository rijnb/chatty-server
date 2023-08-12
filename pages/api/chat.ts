import {OPENAI_API_MAX_TOKENS, OPENAI_DEFAULT_SYSTEM_PROMPT, OPENAI_DEFAULT_TEMPERATURE} from "@/utils/app/const"
import {ChatCompletionStream, OpenAIError} from "@/utils/server"
import {prepareMessagesToSend} from "@/utils/server/tiktoken"
import {ChatBody} from "@/types/chat"
import {OpenAIModelID, OpenAIModels} from "@/types/openai"

export const config = {
  runtime: "edge"
}

const handler = async (req: Request): Promise<Response> => {
  try {
    const {model, messages, key, prompt, temperature} = (await req.json()) as ChatBody
    const {tokenLimit} = OpenAIModels[model.id as OpenAIModelID]

    let promptToSend = prompt || OPENAI_DEFAULT_SYSTEM_PROMPT
    let temperatureToUse = temperature || OPENAI_DEFAULT_TEMPERATURE

    let messagesToSend = await prepareMessagesToSend(
      tokenLimit,
      OPENAI_API_MAX_TOKENS,
      promptToSend,
      messages,
      model.id
    )

    return ChatCompletionStream(model, promptToSend, temperatureToUse, key, messagesToSend)
  } catch (error) {
    const {status, statusText, content, message} = error as any
    console.warn(
      `HTTP stream error, status:${status}, statusText:${statusText}, content:${content}, message:${message}`
    )
    if (error instanceof OpenAIError) {
      console.error(`Error in OpenAI stream, message:${error.message}`)
      if (error.message.includes("content management policy")) {
        return new Response(`Warning: ${error.message}\n\nPlease rephrase your question.`, {
          status: 200
        })
      } else if (error.message.includes("rate limit")) {
        return new Response(`${error.message}`, {
          status: 500,
          statusText: error.message
        })
      } else if (error.message.includes("Azure")) {
        return new Response(`Warning: ${error.message}`, {
          status: 200
        })
      } else {
        return new Response(`${error.message}`, {
          status: 500,
          statusText: error.message
        })
      }
    } else if (error instanceof TypeError) {
      console.error(`Type error, message:${error.message}, error.stack:${error.stack}`)
      return new Response(`Error: Server responded with ${error.message}`, {
        status: 500,
        statusText: `Server responded with: ${error.message}`
      })
    } else {
      console.error(`Other stream error, error:${error}`)
      return new Response("Error: Server responded with an error", {
        status: 500,
        statusText: "Server responded with an error"
      })
    }
  }
}

export default handler
