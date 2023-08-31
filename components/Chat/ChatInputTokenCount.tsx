import {useEffect, useMemo, useState} from "react"
import {useTranslation} from "react-i18next"

import {useHomeContext} from "@/pages/api/home/home.context"
import {Message} from "@/types/chat"
import {FALLBACK_OPENAI_MODEL_ID} from "@/types/openai"
import {OPENAI_API_MAX_TOKENS} from "@/utils/app/const"
import {TiktokenEncoder} from "@/utils/server/tiktoken"

interface Props {
  content: string | undefined
  tokenLimit: number | undefined
}

export const ChatInputTokenCount = ({content, tokenLimit}: Props) => {
  const {t} = useTranslation("common")
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
  const maxTokens = selectedConversation.maxTokens ?? OPENAI_API_MAX_TOKENS

  return tokenCount + maxTokens > tokenLimit ? (
    <div className="pointer-events-auto rounded-full bg-red-500 bg-opacity-40 px-2 py-1 text-xs text-neutral-400">
      {tokenCount} / {tokenLimit} ({maxTokens}) {t("tokens")}
    </div>
  ) : (
    <div className="pointer-events-auto rounded-full bg-neutral-300 bg-opacity-10 px-2 py-1 text-xs text-neutral-400">
      {tokenCount} / {tokenLimit} ({maxTokens}) {t("tokens")}
    </div>
  )
}

export default ChatInputTokenCount
