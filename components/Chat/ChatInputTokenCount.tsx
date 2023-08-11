import {FC, useContext} from "react"
import {useTranslation} from "react-i18next"
import {Message} from "@/types/chat"
import {OpenAIModel} from "@/types/openai"
import HomeContext from "@/pages/api/home/home.context"
import {get_encoding} from "@dqbd/tiktoken"


const tokenizer = get_encoding("cl100k_base")

const getNrOfTokens = (message: string, history: Message[], systemPrompt: string, model: OpenAIModel | undefined) => {
  let tokenCount = tokenizer.encode(systemPrompt).length
  tokenCount += 3 // Reply starts with <|start|>assistant<|end|>.
  tokenCount += 5 // We're off by 5. Unsure why.

  const encodedContent = tokenizer.encode(message)
  const encodedRole = tokenizer.encode("user")
  const nextMessageTokenCount = 4 + encodedContent.length + encodedRole.length

  // Fill with messages from the end until we reach the token limit. Then start skipping messages.
  for (let i = history.length - 1; i >= 0; --i) {
    const nextMessage = history[i]
    const encodedContent = tokenizer.encode(nextMessage.content)
    const encodedRole = tokenizer.encode(nextMessage.role)
    const nextMessageTokenCount = 4 + encodedContent.length + encodedRole.length
    tokenCount += nextMessageTokenCount
  }
  return tokenCount
}

interface Props {
  content: string | undefined
  tokenLimit: number
}

export const ChatInputTokenCount: FC<Props> = ({content, tokenLimit}) => {
  const {t} = useTranslation("chat")
  const {
    state: {selectedConversation}
  } = useContext(HomeContext)

  const nrOfTokens = getNrOfTokens(
    content ?? "",
    selectedConversation?.messages ?? [],
    selectedConversation?.prompt ?? "",
    selectedConversation?.model
  )
  return nrOfTokens > tokenLimit ? (
    <div className="pointer-events-auto rounded-full bg-red-500 bg-opacity-40 px-2 py-1 text-xs text-neutral-400">
      {nrOfTokens} / {tokenLimit} {t("tokens")}
    </div>
  ) : (
    <div className="pointer-events-auto rounded-full bg-neutral-300 bg-opacity-10 px-2 py-1 text-xs text-neutral-400">
      {nrOfTokens} / {tokenLimit} {t("tokens")}
    </div>
  )
}

export default ChatInputTokenCount