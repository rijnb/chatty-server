import {Tiktoken} from "js-tiktoken"
import {useEffect, useState} from "react"
import {useTranslation} from "react-i18next"

import {useHomeContext} from "@/pages/api/home/home.context"
import {Message} from "@/types/chat"
import {OPENAI_API_MAX_TOKENS} from "@/utils/app/const"
import {getTiktokenEncoding, numberOfTokensInConversation} from "@/utils/server/tiktoken"

interface Props {
  content: string | undefined
  tokenLimit: number | undefined
}

export const ChatInputTokenCount = ({content, tokenLimit}: Props) => {
  const {t} = useTranslation("common")
  const {
    state: {selectedConversation}
  } = useHomeContext()

  const [encoding, setEncoding] = useState<Tiktoken | null>(null)
  const [updateAllowed, setUpdateAllowed] = useState<boolean>(true)
  const [tokenCount, setTokenCount] = useState<number>(0)

  useEffect(() => {
    const initToken = async () => {
      let tokenizer = await getTiktokenEncoding()
      setEncoding(tokenizer)
    }
    initToken()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setUpdateAllowed(true)
    }, 3000)

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval)
  }, [])

  const messages: Message[] = [
    {role: "system", content: selectedConversation?.prompt ?? ""},
    ...(selectedConversation?.messages ?? []),
    {role: "user", content: content ?? ""}
  ]

  if (!encoding || !tokenLimit || !selectedConversation) {
    return null
  }

  // Rate limit the token counting to keep snappy typing.
  if (updateAllowed) {
    setTokenCount(numberOfTokensInConversation(encoding, messages, selectedConversation.modelId))
    setUpdateAllowed(false)
  }
  return tokenCount > tokenLimit - OPENAI_API_MAX_TOKENS ? (
    <div className="pointer-events-auto rounded-full bg-red-500 bg-opacity-40 px-2 py-1 text-xs text-neutral-400">
      {tokenCount} / {tokenLimit} {t("tokens")}
    </div>
  ) : (
    <div className="pointer-events-auto rounded-full bg-neutral-300 bg-opacity-10 px-2 py-1 text-xs text-neutral-400">
      {tokenCount} / {tokenLimit} {t("tokens")}
    </div>
  )
}

export default ChatInputTokenCount
