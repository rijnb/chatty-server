import {useAppInsightsContext} from "@microsoft/applicationinsights-react-js"
import {useTranslation} from "next-i18next"
import {ChatCompletionStreamingRunner} from "openai/lib/ChatCompletionStreamingRunner"
import React, {MutableRefObject, memo, useCallback, useEffect, useRef, useState} from "react"
import toast from "react-hot-toast"

import Spinner from "../Spinner"
import {ChatInput} from "./ChatInput"
import {ErrorMessageDiv} from "./ErrorMessageDiv"
import ChatConversation from "@/components/Chat/ChatConversation"
import ReleaseNotes from "@/components/Chat/ReleaseNotes"
import WelcomeMessage from "@/components/Chat/WelcomeMessage"
import {useUnlock, useUnlockCodeInterceptor} from "@/components/UnlockCode"
import {useFetch} from "@/hooks/useFetch"
import {useHomeContext} from "@/pages/api/home/home.context"
import useApiService from "@/services/useApiService"
import {ChatBody, Conversation, Message} from "@/types/chat"
import {NEW_CONVERSATION_TITLE, OPENAI_DEFAULT_MODEL} from "@/utils/app/const"
import {saveConversationsHistory, saveSelectedConversation} from "@/utils/app/conversations"

interface Props {
  stopConversationRef: MutableRefObject<boolean>
}

export const TOAST_DURATION_MS = 8000
export const RESPONSE_TIMEOUT_MS = 20000

const Chat = memo(({stopConversationRef}: Props) => {
  const {t} = useTranslation("common")
  const appInsights = useAppInsightsContext()
  const {unlocked} = useUnlock()

  const {
    state: {selectedConversation, conversations, models, apiKey, toolConfigurations, serverSideApiKeyIsSet, modelError, defaultModelId},
    dispatch: homeDispatch
  } = useHomeContext()

  const [isReleaseNotesDialogOpen, setIsReleaseNotesDialogOpen] = useState<boolean>(false)
  const {getApiUrl} = useApiService()
  const [waitTime, setWaitTime] = useState<number | null>(null)

  const fetchService = useFetch({
    interceptors: useUnlockCodeInterceptor()
  })

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSendMessage = useCallback(
    async (message: Message, deleteCount = 0) => {
      if (!selectedConversation) {
        return
      }
      let updatedConversation: Conversation
      if (deleteCount) {
        // Remove the last message(s) from the conversation.
        const updatedMessages = [...selectedConversation.messages]
        for (let i = 0; i < deleteCount; i++) {
          updatedMessages.pop()
        }
        updatedConversation = {
          ...selectedConversation,
          messages: [...updatedMessages, message]
        }
      } else {
        // Add the message to the conversation.
        updatedConversation = {
          ...selectedConversation,
          messages: [...selectedConversation.messages, message]
        }
      }
      homeDispatch({field: "selectedConversation", value: updatedConversation})
      homeDispatch({field: "loading", value: true})
      homeDispatch({field: "messageIsStreaming", value: true})

      // Prepare the body for the API call.
      const chatBody: ChatBody = {
        modelId: updatedConversation.modelId,
        messages: updatedConversation.messages,
        apiKey: apiKey,
        prompt: updatedConversation.prompt,
        temperature: updatedConversation.temperature,
        maxTokens: updatedConversation.maxTokens,
        selectedTools: selectedConversation.selectedTools,
        toolConfigurations: Object.fromEntries(
          Object.entries(toolConfigurations).filter(([id, config]) => selectedConversation.selectedTools.includes(id))
        )
      }
      const endpoint = getApiUrl("/api/chat")
      const body = chatBody
      const controller = new AbortController()

      appInsights.trackEvent({
        name: "SendMessage",
        properties: {
          modelId: chatBody.modelId,
          messages: chatBody.messages.length,
          temperature: chatBody.temperature,
          maxTokens: chatBody.maxTokens,
          tokenCount: updatedConversation.tokenCount,
          selectedTools: chatBody.selectedTools.join(", ")
        }
      })

      // Execute the API call.
      try {
        console.debug(`HTTP fetch:${endpoint}`)
        const response = await fetchService.post<Response>(endpoint, {
          body,
          returnRawResponse: true,
          signal: controller.signal
        })
        if (!response.ok) {
          homeDispatch({field: "loading", value: false})
          homeDispatch({field: "messageIsStreaming", value: false})

          const error = await response.json()

          if (error.errorType === "openai_auth_error") {
            toast.error("Invalid API Key. Please enter the correct OpenAI key in left menu bar of Chatty.", {
              duration: TOAST_DURATION_MS
            })
            return
          }

          if (error.errorType === "context_length_exceeded") {
            toast.error(
              `The conversation has become too long. Please reduce the number of messages to shorten it. It's using ${error.requested} tokens, where the limit is ${error.limit} tokens.`,
              {
                duration: TOAST_DURATION_MS
              }
            )
            return
          }

          if (error.errorType === "rate_limit") {
            const waitSecs = Math.max(Math.min(error.retryAfter, 60), 1)
            setWaitTime(waitSecs)
            setTimeout(() => setWaitTime(null), waitSecs * 1000)
            toast.error(`Too many requests. Please wait ${waitSecs} seconds before trying again.`, {
              duration: TOAST_DURATION_MS
            })
            return
          }

          if (error.errorType === "generic_openai_error") {
            toast.error(error.message, {
              duration: TOAST_DURATION_MS
            })
            return
          }

          if (error.errorType === "openai_error") {
            toast.error(error.message, {
              duration: TOAST_DURATION_MS
            })
            return
          }

          if (error.errorType === "unexpected_error") {
            toast.error("Unexpected server error. Please try again a bit later.", {
              duration: TOAST_DURATION_MS
            })
            return
          }

          let errorText = await response.text()
          console.debug(`HTTP error, text:${errorText}`)
          console.debug(
            `HTTP response, status:${response.status}, statusText:${response.statusText}, errorText:${errorText}`
          )
          // Fall back to statusText if errorText is empty.
          if (errorText.length == 0) {
            errorText = response.statusText
          }
          // Fall back to other message.
          if (errorText.length == 0) {
            errorText =
              "The server may be too busy or down. Please try again a bit later. You can try resubmitting your previous message if you wish."
          }
          toast.error(`Server returned error (${response.status})\n\n${errorText}`, {duration: TOAST_DURATION_MS})
          return
        }

        // Get response data (as JSON for plugin, as reader for OpenAI).
        if (!response.body) {
          console.debug(`HTTP get data: no data`)
          homeDispatch({field: "loading", value: false})
          homeDispatch({field: "messageIsStreaming", value: false})
          return
        }

        const stream = ChatCompletionStreamingRunner.fromReadableStream(response.body)

        stream
          .on("connect", () => console.debug("connect"))
          .on("functionCall", (call) => console.debug(`functionCall: ${JSON.stringify(call)}`))
          .on("message", (msg) => console.debug(`message: ${JSON.stringify(msg)}`))
          .on("chatCompletion", (completion) => console.debug(`chatCompletion: ${JSON.stringify(completion)}`))
          .on("finalContent", (contentSnapshot) => console.debug(`finalContent: ${JSON.stringify(contentSnapshot)}`))
          .on("finalMessage", (message) => console.debug(`finalMessage: ${JSON.stringify(message)}`))
          .on("finalChatCompletion", (completion) =>
            console.debug(`finalChatCompletion: ${JSON.stringify(completion)}`)
          )
          .on("finalFunctionCall", (call) => console.debug(`finalFunctionCall: ${JSON.stringify(call)}`))
          .on("functionCallResult", (result) => console.debug(`functionCallResult: ${JSON.stringify(result)}`))
          .on("finalFunctionCallResult", (result) =>
            console.debug(`finalFunctionCallResult: ${JSON.stringify(result)}`)
          )
          .on("error", (error) => console.error(`error: ${JSON.stringify(error)}`))
          .on("abort", () => console.debug("abort"))
          .on("end", () => console.debug("end"))
          .on("totalUsage", (usage) => console.debug(`totalUsage: ${JSON.stringify(usage)}`))
          .on("chunk", (chunk) => console.debug(`chunk: ${JSON.stringify(chunk)}`))
          .on("content", (contentDelta, contentSnapshot) =>
            console.debug(
              `content: contentDelta: ${JSON.stringify(contentDelta)}, contentSnapshot: ${JSON.stringify(
                contentSnapshot
              )}`
            )
          )

        // Update name of conversation when first message is received and the name is still the default value.
        if (updatedConversation.messages.length === 1 && updatedConversation.name === t(NEW_CONVERSATION_TITLE)) {
          const {content} = message
          const maxTitleLength = 30
          const customName = content.length > maxTitleLength ? content.substring(0, maxTitleLength) + "..." : content
          updatedConversation = {
            ...updatedConversation,
            name: customName,
            time: Date.now()
          }
        }

        await stream
          .on("connect", () => {
            const updatedMessages: Message[] = [...updatedConversation.messages, {role: "assistant", content: ""}]
            updatedConversation = {
              ...updatedConversation,
              messages: updatedMessages
            }
            homeDispatch({field: "selectedConversation", value: updatedConversation})
            homeDispatch({field: "loading", value: false})
          })
          .on("message", (message) => {
            if (message.role === "assistant" && message.tool_calls) {
              const newToolCalls = message.tool_calls.map((toolCall) => ({
                functionName: toolCall.function.name,
                arguments: toolCall.function.arguments
              }))

              const updatedMessages: Message[] = updatedConversation.messages.map((m, index) => {
                if (index === updatedConversation.messages.length - 1) {
                  return {
                    ...m,
                    tool_calls: (m.tool_calls || []).concat(newToolCalls)
                  }
                }
                return m
              })
              updatedConversation = {
                ...updatedConversation,
                messages: updatedMessages
              }
              homeDispatch({
                field: "selectedConversation",
                value: updatedConversation
              })
            }
          })
          .on("content", (contentDelta) => {
            const updatedMessages: Message[] = updatedConversation.messages.map((message, index) => {
              if (index === updatedConversation.messages.length - 1) {
                return {
                  ...message,
                  content: message.content + contentDelta
                }
              }
              return message
            })
            updatedConversation = {
              ...updatedConversation,
              messages: updatedMessages
            }
            homeDispatch({
              field: "selectedConversation",
              value: updatedConversation
            })
          })
          .done()

        saveSelectedConversation(updatedConversation)
        const updatedConversations: Conversation[] = conversations.map((conversation) => {
          if (conversation.id === selectedConversation.id) {
            return updatedConversation
          }
          return conversation
        })
        if (updatedConversations.length === 0) {
          updatedConversations.push(updatedConversation)
        }
        homeDispatch({field: "conversations", value: updatedConversations})
        saveConversationsHistory(updatedConversations)
        homeDispatch({field: "messageIsStreaming", value: false})
      } catch (error) {
        const {status, statusText, content, message} = error as any
        console.error(`HTTP error, status:${status}, statusText:${statusText}, content:${content}, message:${message}`)
        if (status === 401) {
          // Not authorized.
          toast.error(`${content}`, {duration: TOAST_DURATION_MS})
        } else if (error instanceof Error) {
          // Some other error, try to figure out what it is.
          if (error.message.includes("timeout")) {
            toast.error(`${error.message}... The server may be busy. Try again later.`, {duration: TOAST_DURATION_MS})
          } else {
            toast.error(`${error.message}`, {duration: TOAST_DURATION_MS})
          }
        } else {
          // No clue. Try some properties and hope for the best.
          const show = message || statusText || (content ? content : "Try again later.")
          if (statusText && statusText !== "") {
            toast.error(`The server returned an error...\n\n${show}`, {duration: TOAST_DURATION_MS})
          }
        }
        homeDispatch({field: "loading", value: false})
        homeDispatch({field: "messageIsStreaming", value: false})
        return
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apiKey, conversations, fetchService, getApiUrl, homeDispatch, selectedConversation, stopConversationRef]
  )

  useEffect(() => {
    if (waitTime && waitTime > 0) {
      const timer = setTimeout(() => {
        setWaitTime(waitTime - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [waitTime])

  return (
    <div className="relative flex-1 overflow-hidden bg-white dark:bg-[#343541]">
      {modelError ? (
        <ErrorMessageDiv error={modelError} />
      ) : (
        <>
          <div className="h-full overflow-hidden">
            {selectedConversation?.messages.length === 0 && <WelcomeMessage />}
            {!serverSideApiKeyIsSet && !apiKey && (
              <div className="mb-2 py-12 text-center text-red-800 dark:text-red-400">
                Please enter the correct OpenAI key in left menu bar of Chatty.
              </div>
            )}
            {models.length === 0 && (
              <div className="mx-auto flex flex-col space-y-5 px-3 pt-5 text-center font-bold text-gray-600 dark:text-gray-300 sm:max-w-[600px] md:space-y-10 md:pt-12">
                <div>
                  Loading models...
                  <Spinner size="16px" className="mx-auto" />
                </div>
              </div>
            )}

            {selectedConversation && (
              <ChatConversation
                conversation={selectedConversation}
                onSend={(message, index) => {
                  // noinspection JSIgnoredPromiseFromCall
                  handleSendMessage(message, selectedConversation?.messages.length - index)
                }}
              />
            )}
          </div>

          {(serverSideApiKeyIsSet || apiKey) && unlocked && models.length > 0 && (
            <ChatInput
              stopConversationRef={stopConversationRef}
              textareaRef={textareaRef}
              retryAfter={waitTime}
              modelId={selectedConversation ? selectedConversation.modelId : defaultModelId}
              onSend={(message) => {
                // noinspection JSIgnoredPromiseFromCall
                handleSendMessage(message, 0)
              }}
              onRegenerate={() => {
                if (!selectedConversation) {
                  return
                }

                // Figure out how many messages to remove (last 'user' + optional 'assistant').
                const messageIdxToResend = selectedConversation.messages.findLastIndex((t) => t.role === "user")
                if (messageIdxToResend !== -1) {
                  // noinspection JSIgnoredPromiseFromCall
                  handleSendMessage(
                    selectedConversation.messages[messageIdxToResend],
                    selectedConversation.messages.length - messageIdxToResend
                  )
                }
              }}
            />
          )}
        </>
      )}
      {isReleaseNotesDialogOpen && <ReleaseNotes close={() => setIsReleaseNotesDialogOpen(false)} />}
    </div>
  )
})

Chat.displayName = "Chat"
export default Chat
