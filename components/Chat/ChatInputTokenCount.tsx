import {IconEraser} from "@tabler/icons-react"
import {useTheme} from "next-themes"
import {useEffect, useMemo, useState} from "react"
import {useTranslation} from "react-i18next"

import {useHomeContext} from "@/pages/api/home/home.context"
import {Message, MessageItem} from "@/types/chat"
import {NEW_CONVERSATION_TITLE} from "@/utils/app/const"
import {TiktokenEncoder} from "@/utils/server/tiktoken"

interface Props {
  content: string | undefined
  inputTokenLimit: number | undefined
}

export const ChatInputTokenCount = ({content, inputTokenLimit}: Props) => {
  const {t} = useTranslation("common")
  const {theme} = useTheme()
  const {
    state: {selectedConversation, messageIsStreaming, defaultModelId, reuseModel},
    handleUpdateConversation
  } = useHomeContext()

  const [encoder, setEncoder] = useState<TiktokenEncoder | null>(null)
  const [tokensInConversation, setTokensInConversation] = useState(0)

  const prompt = selectedConversation?.prompt ?? ""
  const messages: Message[] = useMemo(() => selectedConversation?.messages ?? [], [selectedConversation?.messages])
  const modelId = selectedConversation?.modelId ?? defaultModelId

  const handleClearConversationMessages = () => {
    if (confirm(t("Are you sure you want to clear the messages from this conversation?")) && selectedConversation) {
      handleUpdateConversation(selectedConversation, [
        {key: "name", value: NEW_CONVERSATION_TITLE},
        {key: "messages", value: []},
        {key: "modelId", value: reuseModel ? selectedConversation.modelId : defaultModelId}
      ])
    }
  }

  useEffect(() => {
    const initToken = async () => {
      let tokenizer = await TiktokenEncoder.create()
      setEncoder(tokenizer)
    }
    // noinspection JSIgnoredPromiseFromCall
    initToken()
  }, [])

  useEffect(() => {
    if (encoder && !messageIsStreaming) {
      const allMessages: Message[] = [
        {role: "system", content: prompt},
        ...messages,
        {role: "user", content: [{type: "text", text: ""}]}
      ]
      setTokensInConversation(encoder.numberOfTokensInConversation(allMessages, modelId))

      if (selectedConversation && tokenCount != selectedConversation.tokenCount) {
        handleUpdateConversation(selectedConversation, [{key: "tokenCount", value: tokenCount}])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encoder, messages, modelId, prompt])

  if (!encoder || !inputTokenLimit || !selectedConversation) {
    return null
  }

  const tokenCount = tokensInConversation + encoder.numberOfTokensInString(content ?? "")
  const tokenPercentage = Math.min(100, Math.max(5, Math.floor((tokenCount / inputTokenLimit) * 100)))
  const backgroundColor = theme == "dark" ? "#404050" : "#f0f0f0"
  let textColor = theme == "dark" ? "text-neutral-300" : "text-neutral-800"
  let gradient
  if (tokenPercentage < 75) {
    gradient =
      theme == "dark"
        ? `linear-gradient(90deg, seagreen ${tokenPercentage}%, ${backgroundColor} ${tokenPercentage}%)`
        : `linear-gradient(90deg, palegreen ${tokenPercentage}%, ${backgroundColor} ${tokenPercentage}%)`
  } else if (tokenPercentage < 90) {
    gradient =
      theme == "dark"
        ? `linear-gradient(90deg, sienna ${tokenPercentage}%, ${backgroundColor} ${tokenPercentage}%)`
        : `linear-gradient(90deg, orange ${tokenPercentage}%, ${backgroundColor} ${tokenPercentage}%)`
  } else if (tokenPercentage < 100) {
    gradient =
      theme == "dark"
        ? `linear-gradient(90deg, firebrick ${tokenPercentage}%, ${backgroundColor} ${tokenPercentage}%)`
        : `linear-gradient(90deg, tomato ${tokenPercentage}%, ${backgroundColor} ${tokenPercentage}%)`
  } else {
    gradient = `linear-gradient(90deg, red ${tokenPercentage}%, ${backgroundColor} ${tokenPercentage}%)`
    textColor = theme == "dark" ? "text-yellow-100" : "text-yellow-200"
  }
  return (
    <div
      className={`${textColor} pointer-events-auto flex items-center rounded-full px-2 py-1 text-xs`}
      style={{background: gradient}}
    >
      <button
        className="mr-0.5 rounded-sm p-1 text-neutral-800 opacity-60 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-opacity-50 dark:text-neutral-100 dark:hover:text-neutral-200"
        onClick={handleClearConversationMessages}
        title="Clear conversation"
      >
        <IconEraser size={16} />
      </button>
      {tokenCount} / {inputTokenLimit} tokens {tokenCount > inputTokenLimit && "(truncated)"}
    </div>
  )
}

export default ChatInputTokenCount
