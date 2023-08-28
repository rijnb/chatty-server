import {useTranslation} from "next-i18next"
import React, {MutableRefObject, memo, useCallback, useEffect, useRef, useState} from "react"
import toast from "react-hot-toast"

import Spinner from "../Spinner"
import {ChatInput} from "./ChatInput"
import {ErrorMessageDiv} from "./ErrorMessageDiv"
import ChatConversation from "@/components/Chat/ChatConversation"
import ReleaseNotes from "@/components/Chat/ReleaseNotes"
import {WelcomeMessage} from "@/components/Chat/WelcomeMessage"
import {useUnlock, useUnlockCodeInterceptor} from "@/components/UnlockCode"
import {useFetch} from "@/hooks/useFetch"
import {useHomeContext} from "@/pages/api/home/home.context"
import useApiService from "@/services/useApiService"
import {ChatBody, Conversation, Message} from "@/types/chat"
import {FALLBACK_OPENAI_MODEL_ID} from "@/types/openai"
import {Plugin} from "@/types/plugin"
import {NEW_CONVERSATION_TITLE} from "@/utils/app/const"
import {saveConversationsHistory, saveSelectedConversation} from "@/utils/app/conversations"
import {throttle} from "@/utils/data/throttle"

interface Props {
  stopConversationRef: MutableRefObject<boolean>
}

export const TOAST_DURATION_MS = 8000
export const RESPONSE_TIMEOUT_MS = 20000

const Chat = memo(({stopConversationRef}: Props) => {
  const {t} = useTranslation("common")
  const {unlocked} = useUnlock()

  const {
    state: {selectedConversation, conversations, models, apiKey, pluginKeys, serverSideApiKeyIsSet, modelError},
    dispatch: homeDispatch
  } = useHomeContext()

  const [currentMessage, setCurrentMessage] = useState<Message>()
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true)
  const [isReleaseNotesDialogOpen, setIsReleaseNotesDialogOpen] = useState<boolean>(false)
  const {getEndpoint} = useApiService()
  const [waitTime, setWaitTime] = useState<number | null>(null)

  const fetchService = useFetch({
    interceptors: useUnlockCodeInterceptor()
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSendMessage = useCallback(
    async (message: Message, deleteCount = 0, plugin: Plugin | null = null) => {
      try {
        if (selectedConversation) {
          let updatedConversation: Conversation
          if (deleteCount) {
            const updatedMessages = [...selectedConversation.messages]
            for (let i = 0; i < deleteCount; i++) {
              updatedMessages.pop()
            }
            updatedConversation = {
              ...selectedConversation,
              messages: [...updatedMessages, message]
            }
          } else {
            updatedConversation = {
              ...selectedConversation,
              messages: [...selectedConversation.messages, message]
            }
          }
          homeDispatch({
            field: "selectedConversation",
            value: updatedConversation
          })
          homeDispatch({field: "loading", value: true})
          homeDispatch({field: "messageIsStreaming", value: true})
          const chatBody: ChatBody = {
            modelId: updatedConversation.modelId,
            messages: updatedConversation.messages,
            apiKey: apiKey,
            prompt: updatedConversation.prompt,
            temperature: updatedConversation.temperature
          }
          const endpoint = getEndpoint(plugin)
          let body
          if (!plugin) {
            body = chatBody
          } else {
            body = {
              ...chatBody,
              googleAPIKey: pluginKeys
                .find((key) => key.pluginId === "google-search")
                ?.requiredKeys.find((key) => key.key === "GOOGLE_API_KEY")?.value,
              googleCSEId: pluginKeys
                .find((key) => key.pluginId === "google-search")
                ?.requiredKeys.find((key) => key.key === "GOOGLE_CSE_ID")?.value
            }
          }
          const controller = new AbortController()

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
              toast.error("Invalid API Key. Please enter the correct Azure OpenAI key in left menu bar of Chatty.", {
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
              setWaitTime(error.retryAfter)
              setTimeout(() => setWaitTime(null), error.retryAfter * 1000)
              toast.error(`Too many requests. Please wait ${error.retryAfter} seconds before trying again.`, {
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
              `HTTP response, status:${response.status}, statusText:${response.statusText}, errorText: ${errorText}, headers:${response.headers}`
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
          console.debug(`HTTP get data...`)
          const data = plugin ? await response.json() : response.body?.getReader()
          if (!data) {
            console.debug(`HTTP get data: no data`)
            homeDispatch({field: "loading", value: false})
            homeDispatch({field: "messageIsStreaming", value: false})
            return
          }
          if (!plugin) {
            // Update name of conversation when first message is received and the name is still the default value.
            if (updatedConversation.messages.length === 1 && updatedConversation.name === t(NEW_CONVERSATION_TITLE)) {
              const {content} = message
              const maxTitleLength = 30
              const customName =
                content.length > maxTitleLength ? content.substring(0, maxTitleLength) + "..." : content
              updatedConversation = {
                ...updatedConversation,
                name: customName,
                time: Date.now()
              }
            }
            homeDispatch({field: "loading", value: false})
            const decoder = new TextDecoder()
            let done = false
            let isFirst = true
            let text = ""
            while (!done) {
              if (stopConversationRef.current) {
                console.debug("Stopped conversation...")
                controller.abort()
                done = true
                break
              }
              const chunkResponse = await Promise.race([
                data.read(),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Request timeout")), RESPONSE_TIMEOUT_MS))
              ])
              const {value, done: doneReading} = chunkResponse
              done = doneReading
              const chunkValue = decoder.decode(value, {stream: true})
              text += chunkValue
              if (isFirst) {
                isFirst = false
                const updatedMessages: Message[] = [
                  ...updatedConversation.messages,
                  {role: "assistant", content: chunkValue}
                ]
                updatedConversation = {
                  ...updatedConversation,
                  messages: updatedMessages
                }
                homeDispatch({
                  field: "selectedConversation",
                  value: updatedConversation
                })
              } else {
                const updatedMessages: Message[] = updatedConversation.messages.map((message, index) => {
                  if (index === updatedConversation.messages.length - 1) {
                    return {
                      ...message,
                      content: text
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
              }
            }
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
          } else {
            const {answer} = data
            const updatedMessages: Message[] = [...updatedConversation.messages, {role: "assistant", content: answer}]
            updatedConversation = {
              ...updatedConversation,
              messages: updatedMessages
            }
            homeDispatch({
              field: "selectedConversation",
              value: updatedConversation
            })
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
            homeDispatch({field: "loading", value: false})
            homeDispatch({field: "messageIsStreaming", value: false})
          }
        }
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
          const show = message ? message : statusText ? statusText : content ? content : "Try again later."
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
    [
      apiKey,
      conversations,
      fetchService,
      getEndpoint,
      homeDispatch,
      pluginKeys,
      selectedConversation,
      stopConversationRef
    ]
  )

  const scrollDown = () => {
    if (autoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView(true)
    }
  }
  const throttledScrollDown = throttle(scrollDown, 250)

  useEffect(() => {
    throttledScrollDown()
    selectedConversation && setCurrentMessage(selectedConversation.messages[selectedConversation.messages.length - 2])
  }, [selectedConversation, throttledScrollDown])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setAutoScrollEnabled(entry.isIntersecting)
        if (entry.isIntersecting) {
          textareaRef.current?.focus()
        }
      },
      {
        root: null,
        threshold: 0.5
      }
    )
    const messagesEndElement = messagesEndRef.current
    if (messagesEndElement) {
      observer.observe(messagesEndElement)
    }
    return () => {
      if (messagesEndElement) {
        observer.unobserve(messagesEndElement)
      }
    }
  }, [messagesEndRef])

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
              <div className="mb-2 text-center text-red-800 dark:text-red-400">
                Please enter the correct Azure OpenAI key in left menu bar of Chatty.
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
              modelId={selectedConversation ? selectedConversation.modelId : FALLBACK_OPENAI_MODEL_ID}
              onSend={(message, plugin) => {
                setCurrentMessage(message)
                handleSendMessage(message, 0, plugin)
              }}
              onRegenerate={() => {
                if (currentMessage) {
                  handleSendMessage(currentMessage, 2, null)
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
