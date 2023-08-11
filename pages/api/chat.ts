import {OPENAI_API_MAX_TOKENS, OPENAI_DEFAULT_SYSTEM_PROMPT, OPENAI_DEFAULT_TEMPERATURE} from "@/utils/app/const"
import {trimForPrivacy} from "@/utils/app/privacy"
import {OpenAIError, OpenAIStream} from "@/utils/server"
import {ChatBody, Message} from "@/types/chat"
import {OpenAIModelID, OpenAIModels} from "@/types/openai"
// @ts-expect-error
import wasm from "../../node_modules/@dqbd/tiktoken/lite/tiktoken_bg.wasm?module"
import tiktokenModel from "@dqbd/tiktoken/encoders/cl100k_base.json"
import {Tiktoken, init} from "@dqbd/tiktoken/lite/init"


export const config = {
  runtime: "edge"
}

const handler = async (req: Request): Promise<Response> => {
  try {
    const {model, messages, key, prompt, temperature} = (await req.json()) as ChatBody
    const {tokenLimit} = OpenAIModels[model.id as OpenAIModelID]
    const maxReplyTokens = OPENAI_API_MAX_TOKENS

    await init((imports) => WebAssembly.instantiate(wasm, imports))
    const tokenizer = new Tiktoken(tiktokenModel.bpe_ranks, tiktokenModel.special_tokens, tiktokenModel.pat_str)

    const safetyMargin = 100
    const promptToSend = prompt || OPENAI_DEFAULT_SYSTEM_PROMPT
    const temperatureToUse = temperature || OPENAI_DEFAULT_TEMPERATURE

    let messagesToSend: Message[] = []
    let nrOfMessageSkipped = 0
    let bodyLengthInChars = promptToSend.length
    let tokenCount = tokenizer.encode(promptToSend).length
    tokenCount += 3 // Reply starts with <|start|>assistant<|end|>.
    tokenCount += 5 // We're off by 5. Unsure why.

    // Fill with messages from the end until we reach the token limit. Then start skipping messages.
    for (let i = messages.length - 1; i >= 0; --i) {
      const nextMessage = messages[i]
      const encodedContent = tokenizer.encode(nextMessage.content)
      const encodedRole = tokenizer.encode(nextMessage.role)
      const nextMessageTokenCount = 4 + encodedContent.length + encodedRole.length

      if (tokenCount + nextMessageTokenCount + maxReplyTokens + safetyMargin <= tokenLimit) {
        // We're OK. Add message.
        bodyLengthInChars += nextMessage.content.length
        tokenCount += nextMessageTokenCount
        messagesToSend = [nextMessage, ...messagesToSend]
      } else {
        // Skipping 1 message (from oldest). Try next.
        ++nrOfMessageSkipped
      }
    }
    tokenizer.free()

    // Log prompt for debugging.
    const latestMessage = messages[messages.length - 1]
    console.info(`sendRequest: {\
lastMessage:'${trimForPrivacy(latestMessage.content)}', \
lastMessageLengthInChars:${latestMessage.content.length}, \
tokenCount:${tokenCount}, \
tokenLimit:${model.tokenLimit}, \
bodyLengthInChars:${bodyLengthInChars}, \
nrOfMessagesTotal:${messages.length - nrOfMessageSkipped}, \
nrOfMessagesSkipped:${nrOfMessageSkipped}, \
model:'${model.id}', \
temperature:${temperature}}`)

    const stream = await OpenAIStream(model, promptToSend, temperatureToUse, key, messagesToSend)
    return new Response(stream, {headers: {"Content-Type": "text/plain; charset=utf-8"}})
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