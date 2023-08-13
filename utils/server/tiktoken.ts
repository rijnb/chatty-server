import {Message} from "@/types/chat"
import {Tiktoken} from "js-tiktoken/lite"
import cl100k_base from "js-tiktoken/ranks/cl100k_base"

export async function getTiktokenEncoding(): Promise<Tiktoken> {
  return new Tiktoken(cl100k_base)
}

/**
 * Prepares messages to send to OpenAI.
 * Drop messages starting from the second until the total number of tokens (prompt+reply) is below the model limit.
 * The user prompt (first message) and the last message (user intent) is always sent.
 * If it's not possible error is thrown.
 */
export async function prepareMessagesToSend(
  tokenLimit: number,
  maxReplyTokens: number,
  prompt: string,
  messages: Message[],
  modelId: string
): Promise<Message[]> {
  const encoding = await getTiktokenEncoding()

  const systemPrompt: Message = {role: "assistant", content: prompt}
  const messagesToSend: Message[] = messages.slice()

  while (
    messagesToSend.length > 1 &&
    numTokensInConversation(encoding, [systemPrompt, ...messagesToSend], modelId) + maxReplyTokens > tokenLimit
  ) {
    messagesToSend.splice(1, 1)
  }

  if (messagesToSend.length === 1) {
    throw new Error("Not enough tokens to send a message.")
  }

  return messagesToSend
}

function isGpt3(modelId: string): boolean {
  return modelId.startsWith("gpt-3")
}

/*
 * Returns the number of tokens in a conversation.
 * Simplified version from [OpenAI's cookbook](https://github.com/openai/openai-cookbook/blob/main/examples/How_to_format_inputs_to_ChatGPT_models.ipynb)
 */
export function numTokensInConversation(tokenizer: Tiktoken, messages: Message[], modelId: string) {
  const fixedTokensPerMessage = isGpt3(modelId)
    ? 4 // every message follows <|im_start|>{role}\n{content}<|end|>\n - 4 tokens
    : 3 // every message follows <|im_start|>{role}<|im_sep|>{content}<|im_end|> - 3 tokens
  const fixedTokensPerReply = 3 // every reply is primed with <|im_start|>assistant<|im_sep|> - 3 tokens

  return messages
    .map(({role, content}) => {
      return fixedTokensPerMessage + tokenizer.encode(role).length + tokenizer.encode(content).length
    })
    .reduce((acc, cur) => acc + cur, fixedTokensPerReply)
}
