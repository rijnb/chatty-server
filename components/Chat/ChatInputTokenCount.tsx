import {FC, useContext} from "react"
import {useTranslation} from "react-i18next"
import getNrOfTokens from "@/utils/app/tokens"
import HomeContext from "@/pages/api/home/home.context"
import {get_encoding} from "@dqbd/tiktoken"


interface Props {
  content: string | undefined
  tokenLimit: number
}

const tokenizer = get_encoding("cl100k_base")

export const ChatInputTokenCount: FC<Props> = ({content, tokenLimit}) => {
  const {t} = useTranslation("chat")
  const {
    state: {selectedConversation}
  } = useContext(HomeContext)

  const nrOfTokens = getNrOfTokens(content, selectedConversation?.messages, selectedConversation?.prompt, selectedConversation?.model)
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