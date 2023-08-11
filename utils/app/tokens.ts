import {Message} from "@/types/chat"
import {OpenAIModel} from "@/types/openai"
import {get_encoding} from "@dqbd/tiktoken"


const tokenizer = get_encoding("cl100k_base")

const getNrOfTokens = (
  message: string | undefined,
  history: Message[] | undefined,
  systemPrompt: string | undefined,
  model: OpenAIModel | undefined
) => {
  const allMessages: Array<{role: string; content: string}> = [
    {role: "system", content: systemPrompt ?? ""},
    ...(history ?? []),
    {role: "user", content: message ?? ""}
  ]

  const isGpt3 = model?.id.startsWith("gpt-3")
  const msgSep = isGpt3 ? "\n" : ""
  const roleSep = isGpt3 ? "\n" : "<|im_sep|>"

  const serialized = [
    allMessages
      .map(({role, content}) => {
        return `<|im_start|>${role}${roleSep}${content}<|im_end|>`
      })
      .join(msgSep),
    `<|im_start|>assistant${roleSep}`
  ].join(msgSep)

  return tokenizer.encode(serialized, "all").length
}

export default getNrOfTokens