import {OPENAI_API_MAX_TOKENS, OPENAI_DEFAULT_SYSTEM_PROMPT, OPENAI_DEFAULT_TEMPERATURE} from "@/utils/app/const"
import {trimForPrivacy} from "@/utils/app/privacy"
import {
  ChatCompletionStream,
  GenericOpenAIError,
  OpenAIAuthError,
  OpenAIError,
  OpenAILimitExceeded,
  OpenAIRateLimited
} from "@/utils/server/openAiClient"
import {getTiktokenEncoding, numberOfTokensInConversation, prepareMessagesToSend} from "@/utils/server/tiktoken"
import {ChatBody, Message} from "@/types/chat"
import {OpenAIModels} from "@/types/openai"

export const config = {
  runtime: "edge"
}

const handler = async (req: Request): Promise<Response> => {
  try {
    const encoding = await getTiktokenEncoding()
    const {messages, apiKey, modelId, prompt, temperature} = (await req.json()) as ChatBody
    const {tokenLimit} = OpenAIModels[modelId]

    const promptToSend = prompt || OPENAI_DEFAULT_SYSTEM_PROMPT
    const messagesToSend = await prepareMessagesToSend(
      tokenLimit,
      OPENAI_API_MAX_TOKENS,
      promptToSend,
      messages,
      modelId
    )
    const temperatureToUse = temperature || OPENAI_DEFAULT_TEMPERATURE

    // Log prompt statistics (not just debugging, also for checking use of service).
    const allMessages: Message[] = [{role: "system", content: promptToSend}, ...(messagesToSend ?? [])]
    const message = allMessages[allMessages.length - 1]
    console.info(`sendRequest: {\
message:'${trimForPrivacy(message.content)}', \
totalNumberOfTokens:${numberOfTokensInConversation(encoding, allMessages, modelId)}, \
modelId:'${modelId}', \
messageLengthInChars:${message.content.length}, \
totalNumberOfMessages:${allMessages.length}, \
temperature:${temperature}}`)

    return ChatCompletionStream(modelId, promptToSend, temperatureToUse, apiKey, messagesToSend)
  } catch (error) {
    const {status, statusText, content, message} = error as any
    console.warn(
      `HTTP stream error, status:${status}, statusText:${statusText}, content:${content}, message:${message}`
    )
    if (error instanceof OpenAIRateLimited) {
      return new Response(
        JSON.stringify({
          errorType: "rate_limit",
          retryAfter: error.retryAfterSeconds
        }),
        {
          status: 429
        }
      )
    }

    if (error instanceof OpenAIAuthError) {
      return new Response(
        JSON.stringify({
          errorType: "openai_auth_error"
        }),
        {
          status: 401
        }
      )
    }

    if (error instanceof OpenAILimitExceeded) {
      return new Response(
        JSON.stringify({
          errorType: "context_length_exceeded",
          limit: error.limit,
          requested: error.requested
        }),
        {
          status: 400
        }
      )
    }

    if (error instanceof GenericOpenAIError) {
      return new Response(
        JSON.stringify({
          errorType: error.type,
          message: error.message,
          param: error.param,
          code: error.code
        }),
        {
          status: 500
        }
      )
    }

    if (error instanceof OpenAIError) {
      return new Response(
        JSON.stringify({
          errorType: "openai_error",
          message: error.message
        }),
        {
          status: 500
        }
      )
    }

    if (error instanceof TypeError) {
      console.error(`Type error, message:${error.message}, error.stack:${error.stack}`)
      return new Response(
        JSON.stringify({
          errorType: "type_error",
          message: error.message
        }),
        {
          status: 500
        }
      )
    }

    console.error(`Other stream error, error:${error}`)
    return new Response(
      JSON.stringify({
        errorType: "unknown_error"
      }),
      {
        status: 500
      }
    )
  }
}

export default handler
