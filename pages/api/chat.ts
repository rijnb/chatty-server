import {OPENAI_API_MAX_TOKENS, OPENAI_DEFAULT_SYSTEM_PROMPT, OPENAI_DEFAULT_TEMPERATURE} from "@/utils/app/const"
import {trimForPrivacy} from "@/utils/app/privacy"
import {ChatCompletionStream} from "@/utils/server"
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
    console.error(`HTTP stream handler error, error=${JSON.stringify(error)}`)
    if (error instanceof TypeError) {
      return new Response(`Error: Server responded with: ${error.message}`, {
        status: 500,
        statusText: `Server responded with: ${error.message}`
      })
    } else {
      return new Response("Error: Server responded with an error.", {
        status: 500,
        statusText: "Server responded with an error."
      })
    }
  }
}

export default handler