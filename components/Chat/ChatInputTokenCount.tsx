import {useTheme} from "next-themes"
import {useEffect, useMemo, useState} from "react"
import {useTranslation} from "react-i18next"

import {useHomeContext} from "@/pages/api/home/home.context"
import {Message} from "@/types/chat"
import {FALLBACK_OPENAI_MODEL_ID} from "@/types/openai"
import {TiktokenEncoder} from "@/utils/server/tiktoken"

interface Props {
  content: string | undefined
  tokenLimit: number | undefined
}

export const ChatInputTokenCount = ({content, tokenLimit}: Props) => {
  const {t} = useTranslation("common")
  const {theme} = useTheme()
  const {
    state: {selectedConversation}
  } = useHomeContext()

  const [encoder, setEncoder] = useState<TiktokenEncoder | null>(null)
  const [tokensInConversation, setTokensInConversation] = useState(0)

  useEffect(() => {
    const initToken = async () => {
      let tokenizer = await TiktokenEncoder.create()
      setEncoder(tokenizer)
    }
    // noinspection JSIgnoredPromiseFromCall
    initToken()
  }, [])

  const prompt = selectedConversation?.prompt ?? ""
  const messages: Message[] = useMemo(() => selectedConversation?.messages ?? [], [selectedConversation?.messages])
  const modelId = selectedConversation?.modelId ?? FALLBACK_OPENAI_MODEL_ID

  useEffect(() => {
    if (encoder) {
      const allMessages: Message[] = [{role: "system", content: prompt}, ...messages, {role: "user", content: ""}]
      setTokensInConversation(encoder.numberOfTokensInConversation(allMessages, modelId))
    }
  }, [encoder, messages, modelId, prompt])

  if (!encoder || !tokenLimit || !selectedConversation) {
    return null
  }

  const tokenCount = tokensInConversation + encoder.numberOfTokensInString(content ?? "")
  const tokenPercentage = Math.min(100, Math.max(5, Math.floor(+(tokenCount / tokenLimit) * 100)))
  const backgroundColor = theme == "dark" ? "#404050" : "#f0f0f0"
  const textColor = theme == "dark" ? "text-neutral-400" : "text-neutral-800"
  let gradient
  if (tokenPercentage <= 60) {
    gradient =
      theme == "dark"
        ? `linear-gradient(90deg, seagreen ${tokenPercentage}%, ${backgroundColor} ${tokenPercentage}%)`
        : `linear-gradient(90deg, palegreen ${tokenPercentage}%, ${backgroundColor} ${tokenPercentage}%)`
  } else if (tokenPercentage <= 80) {
    gradient =
      theme == "dark"
        ? `linear-gradient(90deg, sienna ${tokenPercentage}%, ${backgroundColor} ${tokenPercentage}%)`
        : `linear-gradient(90deg, bisque ${tokenPercentage}%, ${backgroundColor} ${tokenPercentage}%)`
  } else {
    gradient =
      theme == "dark"
        ? `linear-gradient(90deg, firebrick ${tokenPercentage}%, ${backgroundColor} ${tokenPercentage}%)`
        : `linear-gradient(90deg, tomato ${tokenPercentage}%, ${backgroundColor} ${tokenPercentage}%)`
  }
  return (
    <div className={`${textColor} pointer-events-auto rounded-full px-2 py-1 text-xs`} style={{background: gradient}}>
      {tokenCount} / {tokenLimit} tokens
    </div>
  )
}

export default ChatInputTokenCount
