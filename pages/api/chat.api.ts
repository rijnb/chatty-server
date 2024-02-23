import cl100k_base from "js-tiktoken/ranks/cl100k_base"
import {NextApiRequest, NextApiResponse} from "next"

import {ChatBody, Message} from "@/types/chat"
import {OpenAIModels, maxTokensForModel} from "@/types/openai"
import {OPENAI_API_MAX_TOKENS, OPENAI_DEFAULT_SYSTEM_PROMPT, OPENAI_DEFAULT_TEMPERATURE} from "@/utils/app/const"
import {trimForPrivacy} from "@/utils/app/privacy"
import {
  ChatCompletionStream,
  GenericOpenAIError,
  OpenAIAuthError,
  OpenAIError,
  OpenAILimitExceeded,
  OpenAIRateLimited,
  streamToResponse
} from "@/utils/server/openAiClient"
import {TiktokenEncoder} from "@/utils/shared/tiktoken"
import {LimitExceeded} from "@/utils/shared/types"

function errorResponse(res: NextApiResponse, body: any, status: number) {
  return res.status(status).json(body)
}

const encoder = TiktokenEncoder.wrap(cl100k_base)

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const {messages, apiKey, modelId, prompt, temperature, maxTokens, selectedTools, toolConfigurations} =
      req.body as ChatBody
    const tokenLimit = maxTokensForModel(modelId)

    const maxTokensToUse = maxTokens || OPENAI_API_MAX_TOKENS
    const promptToSend = prompt || OPENAI_DEFAULT_SYSTEM_PROMPT
    const messagesToSend = encoder.prepareMessagesToSend(tokenLimit, maxTokensToUse, promptToSend, messages, modelId)
    const temperatureToUse = temperature || OPENAI_DEFAULT_TEMPERATURE

    // Log prompt statistics (not just debugging, also for checking use of service).
    const allMessages: Message[] = [{role: "system", content: promptToSend}, ...(messagesToSend ?? [])]
    const message = allMessages[allMessages.length - 1]
    console.info(`sendRequest: {\
message:'${trimForPrivacy(message.content)}', \
totalNumberOfTokens:${encoder.numberOfTokensInConversation(allMessages, modelId)}, \
modelId:'${modelId}', \
messageLengthInChars:${message.content.length}, \
totalNumberOfMessages:${allMessages.length}, \
temperature:${temperature}, \
maxTokens:${maxTokens}}`)

    const stream = await ChatCompletionStream(
      modelId,
      promptToSend,
      temperatureToUse,
      maxTokensToUse,
      apiKey,
      selectedTools,
      toolConfigurations,
      messagesToSend
    )

    stream.pipe(res)
  } catch (error) {
    if (error instanceof OpenAIRateLimited) {
      return errorResponse(
        res,
        {
          errorType: "rate_limit",
          retryAfter: error.retryAfterSeconds
        },
        429
      )
    }

    if (error instanceof OpenAIAuthError) {
      return errorResponse(
        res,
        {
          errorType: "openai_auth_error"
        },
        401
      )
    }

    if (error instanceof OpenAILimitExceeded || error instanceof LimitExceeded) {
      return errorResponse(
        res,
        {
          errorType: "context_length_exceeded",
          limit: error.limit,
          requested: error.requested
        },
        400
      )
    }

    if (error instanceof GenericOpenAIError) {
      return errorResponse(
        res,
        {
          errorType: "generic_openai_error",
          message: error.message
        },
        400
      )
    }

    if (error instanceof OpenAIError) {
      return errorResponse(
        res,
        {
          errorType: "openai_error",
          message: error.message
        },
        500
      )
    }

    console.error("Unexpected error", error)
    if (error instanceof Error) {
      return errorResponse(
        res,
        {
          errorType: "unexpected_error",
          message: error.message
        },
        500
      )
    }

    return errorResponse(
      res,
      {
        errorType: "unexpected_error",
        message: "Unknown error"
      },
      500
    )
  }
}

export default handler
