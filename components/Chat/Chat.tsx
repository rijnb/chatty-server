/*
 * Copyright (C) 2024, Rijn Buve.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions
 * of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import {useAppInsightsContext} from "@microsoft/applicationinsights-react-js"
import {useTranslation} from "next-i18next"
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
import {ChatBody, Conversation, Message, getMessageAsStringOnlyText} from "@/types/chat"
import {Plugin} from "@/types/plugin"
import {NEW_CONVERSATION_TITLE} from "@/utils/app/const"
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
    state: {
      selectedConversation,
      currentMessage,
      conversations,
      models,
      apiKey,
      pluginKeys,
      serverSideApiKeyIsSet,
      modelError,
      defaultModelId
    },
    dispatch: homeDispatch
  } = useHomeContext()

  const [isReleaseNotesDialogOpen, setIsReleaseNotesDialogOpen] = useState<boolean>(false)
  const {getEndpoint} = useApiService()
  const [waitTime, setWaitTime] = useState<number | null>(null)

  const fetchService = useFetch({
    interceptors: useUnlockCodeInterceptor()
  })

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSendMessage = useCallback(
    async (message: Message, deleteCount = 0, plugin: Plugin | null = null) => {
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
        outputTokenLimit: updatedConversation.maxTokens
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

      appInsights.trackEvent({
        name: "SendMessage",
        properties: {
          plugin: plugin ?? "chat",
          modelId: chatBody.modelId,
          messages: chatBody.messages.length,
          temperature: chatBody.temperature,
          maxTokens: chatBody.outputTokenLimit,
          tokenCount: updatedConversation.tokenCount
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
            const maxTitleLength = 30
            const name = getMessageAsStringOnlyText(message)
            const customName = name.length > maxTitleLength ? name.substring(0, maxTitleLength) + "..." : name
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
              homeDispatch({field: "selectedConversation", value: updatedConversation})
            } else {
              const updatedMessages: Message[] = updatedConversation.messages.map((message, index) => {
                if (index === updatedConversation.messages.length - 1) {
                  return {...message, content: text}
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
          homeDispatch({field: "selectedConversation", value: updatedConversation})
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
          const show = message || statusText || content || "Try again later."
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
              onSend={(message, plugin) => {
                // setCurrentMessage(message)
                homeDispatch({field: "currentMessage", value: currentMessage})
                // noinspection JSIgnoredPromiseFromCall
                handleSendMessage(message, 0, plugin)
              }}
              onRegenerate={() => {
                // Select the last message if there is one.
                let newCurrentMessage = currentMessage
                if (!newCurrentMessage && selectedConversation?.messages.length) {
                  newCurrentMessage =
                    selectedConversation?.messages.length > 0
                      ? selectedConversation.messages.reduce((lastUserMessage, message) => {
                          return message.role === "user" ? message : lastUserMessage
                        })
                      : undefined
                  homeDispatch({field: "currentMessage", value: newCurrentMessage})
                }

                // Figure out how many messages to remove (last 'user' + optional 'assistant').
                let deleteCount = 0
                if (newCurrentMessage) {
                  if (selectedConversation?.messages.length) {
                    if (selectedConversation.messages[selectedConversation.messages.length - 1].role === "user") {
                      deleteCount = 1
                    } else {
                      deleteCount = 2
                    }
                  }
                  // noinspection JSIgnoredPromiseFromCall
                  handleSendMessage(newCurrentMessage, deleteCount, null)
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
