import {useContext, useEffect, useState} from "react"
import {useTranslation} from "react-i18next"
import {getTiktokenEncoding, numberOfTokensInConversation} from "@/utils/server/tiktoken"
import {Message} from "@/types/chat"
import HomeContext from "@/pages/api/home/home.context"
import {Tiktoken} from "js-tiktoken"


interface Props {
  content: string | undefined
  tokenLimit: number | undefined
}

export const ChatInputTokenCount = ({content, tokenLimit}: Props) => {
  const {t} = useTranslation("common")
  const {
    state: {selectedConversation}
  } = useContext(HomeContext)

  const [encoding, setEncoding] = useState<Tiktoken | null>(null)

  useEffect(() => {
    const initToken = async () => {
      let tokenizer = await getTiktokenEncoding()
      setEncoding(tokenizer)
    }
    initToken()
  }, [])

  const messages: Message[] = [
    {role: "system", content: selectedConversation?.prompt ?? ""},
    ...(selectedConversation?.messages ?? []),
    {role: "user", content: content ?? ""}
  ]

  if (!encoding || !tokenLimit || !selectedConversation) {
    return null
  }
  const count = numberOfTokensInConversation(encoding, messages, selectedConversation.modelId)
  return count > tokenLimit ? (
    <div className="pointer-events-auto rounded-full bg-red-500 bg-opacity-40 px-2 py-1 text-xs text-neutral-400">
      {count} / {tokenLimit} {t("tokens")}
    </div>
  ) : (
    <div className="pointer-events-auto rounded-full bg-neutral-300 bg-opacity-10 px-2 py-1 text-xs text-neutral-400">
      {count} / {tokenLimit} {t("tokens")}
    </div>
  )
}

export default ChatInputTokenCount