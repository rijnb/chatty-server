import cl100k_base from "js-tiktoken/ranks/cl100k_base"
import {NextApiRequest, NextApiResponse} from "next"

import {ChatBody, Message} from "@/types/chat"
import {OpenAIModels, maxTokensForModel} from "@/types/openai"
import {OPENAI_API_MAX_TOKENS, OPENAI_DEFAULT_SYSTEM_PROMPT, OPENAI_DEFAULT_TEMPERATURE} from "@/utils/app/const"
import {trimForPrivacy} from "@/utils/app/privacy"
import {transformError} from "@/utils/server/errors"
import {chatCompletionStream} from "@/utils/server/openAiClient"
import {TiktokenEncoder} from "@/utils/shared/tiktoken"
import {EventParameters, EventType} from "@/utils/shared/types"

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
    console.info(
      "sendRequest: {" +
        `message:'${trimForPrivacy(message.content)}', ` +
        `totalNumberOfTokens:${encoder.numberOfTokensInConversation(allMessages, modelId)}, ` +
        `modelId:'${modelId}', ` +
        `messageLengthInChars:${message.content.length}, ` +
        `totalNumberOfMessages:${allMessages.length}, ` +
        `temperature:${temperature}, ` +
        `maxTokens:${maxTokens}` +
        "}"
    )

    const emit = (event: EventType, ...data: EventParameters<EventType>) => {
      res.write(JSON.stringify({event, data}) + "\n")

      if (event === "end") {
        res.end()
        return
      }
    }

    await chatCompletionStream(
      modelId,
      promptToSend,
      temperatureToUse,
      maxTokensToUse,
      apiKey,
      selectedTools ?? [],
      toolConfigurations ?? [],
      messagesToSend
    )
      .on("connect", () => {
        emit("connect")
      })
      .on("content", (contentDelta, contentSnapshot) => {
        emit("content", {delta: contentDelta, snapshot: contentSnapshot})
      })
      .on("error", (error) => {
        emit("error", transformError(error))
      })
      .on("end", () => {
        emit("end")
      })
      .on("functionCall", (call) => {
        emit("toolCall", call.name, call.arguments)
      })
      .done()
  } catch (error) {
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
