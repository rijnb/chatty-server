import {Tiktoken} from "js-tiktoken/lite"

import {Message} from "@/types/chat"
import {OpenAIModelID} from "@/types/openai"
import {OpenAILimitExceeded} from "@/utils/server/openAiClient"

export async function getTiktokenEncoding(): Promise<Tiktoken> {
  const cl100k_base = await import("js-tiktoken/ranks/cl100k_base")
  return new Tiktoken(cl100k_base.default)
}

/**
 * Prepares messages to send to OpenAI.
 * Drop messages starting from the second until the total number of tokens (prompt+reply) is below the model limit.
 * The user prompt (first message) and the last message (user intent) is always sent.
 * If it's not possible, error is thrown.
 */
export async function prepareMessagesToSend(
  tokenLimit: number,
  maxReplyTokens: number,
  prompt: string,
  messages: Message[],
  modelId: OpenAIModelID
): Promise<Message[]> {
  const encoding = await getTiktokenEncoding()
  const [messagesToSend, requiredTokens] = reduceMessagesToSend(
    tokenLimit,
    maxReplyTokens,
    prompt,
    messages,
    modelId,
    encoding
  )

  if (requiredTokens > tokenLimit) {
    throw new OpenAILimitExceeded("Not enough tokens to send a message.", tokenLimit, requiredTokens)
  }

  return messagesToSend
}

/**
 * Reduces the number of messages to send in order to fit within the token limit.
 */
function reduceMessagesToSend(
  tokenLimit: number,
  maxReplyTokens: number,
  prompt: string,
  messages: Message[],
  modelId: OpenAIModelID,
  encoding: Tiktoken
): [Message[], number] {
  const systemPrompt: Message = {role: "assistant", content: prompt}
  const messagesToSend: Message[] = messages.slice()

  const requiredTokens = () => {
    return numberOfTokensInConversation(encoding, [systemPrompt, ...messagesToSend], modelId) + maxReplyTokens
  }

  while (messagesToSend.length > 1 && requiredTokens() > tokenLimit) {
    messagesToSend.splice(1, 1)
  }

  return [messagesToSend, requiredTokens()]
}

function isModelGpt3(modelId: OpenAIModelID): boolean {
  return modelId.startsWith("gpt-3")
}

/*
 * Returns the number of tokens in a conversation.
 * Simplified version from [OpenAI's cookbook](https://github.com/openai/openai-cookbook/blob/main/examples/How_to_format_inputs_to_ChatGPT_models.ipynb)
 */
export function numberOfTokensInConversation(tokenizer: Tiktoken, messages: Message[], modelId: OpenAIModelID) {
  const fixedTokensPerMessage = isModelGpt3(modelId)
    ? 4 // every message follows <|im_start|>{role}\n{content}<|end|>\n - 4 tokens
    : 3 // every message follows <|im_start|>{role}<|im_sep|>{content}<|im_end|> - 3 tokens
  const fixedTokensPerReply = 3 // every reply is primed with <|im_start|>assistant<|im_sep|> - 3 tokens

  return messages
    .map(({role, content}) => {
      return fixedTokensPerMessage + tokenizer.encode(role).length + tokenizer.encode(content).length
    })
    .reduce((acc, cur) => acc + cur, fixedTokensPerReply)
}
