/*
 * Copyright (C) 2024, Rijn Buve.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions
 * of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import cl100k_base from "js-tiktoken/ranks/cl100k_base"

import {ChatBody, Message, getMessageAsString} from "@/types/chat"
import {maxInputTokensForModel} from "@/types/openai"
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
import {TiktokenEncoder} from "@/utils/server/tiktoken"

function errorResponse(body: any, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  })
}

export const config = {
  runtime: "edge"
}

const encoder = TiktokenEncoder.wrap(cl100k_base)

const handler = async (req: Request): Promise<Response> => {
  try {
    const {messages, apiKey, modelId, prompt, temperature, outputTokenLimit} = (await req.json()) as ChatBody
    const inputTokenLimit = maxInputTokensForModel(modelId)

    const maxReplyTokensToUse = outputTokenLimit || OPENAI_API_MAX_TOKENS
    const promptToSend = prompt || OPENAI_DEFAULT_SYSTEM_PROMPT
    const messagesToSend = encoder.prepareMessagesToSend(
      inputTokenLimit,
      maxReplyTokensToUse,
      promptToSend,
      messages,
      modelId
    )
    const temperatureToUse = temperature || OPENAI_DEFAULT_TEMPERATURE

    // Log prompt statistics (not just debugging, also for checking use of service).
    const allMessages: Message[] = [{role: "system", content: promptToSend}, ...(messagesToSend ?? [])]
    const message = allMessages[allMessages.length - 1]
    const messageString = getMessageAsString(message)
    console.info(`sendRequest: {\
        message:'${trimForPrivacy(messageString)}', \
        totalNumberOfTokens:${encoder.numberOfTokensInConversation(allMessages, modelId)}, \
        modelId:'${modelId}', \
        messageLengthInChars:${messageString.length}, \
        totalNumberOfMessages:${allMessages.length}, \
        temperature:${temperature}, \
        maxTokens:${maxReplyTokensToUse}}`)

    return await ChatCompletionStream(
      modelId,
      promptToSend,
      temperatureToUse,
      maxReplyTokensToUse,
      apiKey,
      messagesToSend
    )
  } catch (error) {
    if (error instanceof OpenAIRateLimited) {
      return errorResponse(
        {
          errorType: "rate_limit",
          retryAfter: error.retryAfterSeconds
        },
        429
      )
    }

    if (error instanceof OpenAIAuthError) {
      return errorResponse(
        {
          errorType: "openai_auth_error"
        },
        401
      )
    }

    if (error instanceof OpenAILimitExceeded) {
      return errorResponse(
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
        {
          errorType: "generic_openai_error",
          message: error.message
        },
        400
      )
    }

    if (error instanceof OpenAIError) {
      return errorResponse(
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
        {
          errorType: "unexpected_error",
          message: error.message
        },
        500
      )
    }

    return errorResponse(
      {
        errorType: "unexpected_error",
        message: "Unknown error"
      },
      500
    )
  }
}

export default handler
