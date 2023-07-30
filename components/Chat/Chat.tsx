import {IconEraser, IconHelp, IconMarkdown, IconRobot, IconScreenshot} from "@tabler/icons-react"
import React, {MutableRefObject, memo, useCallback, useContext, useEffect, useRef, useState} from "react"
import toast from "react-hot-toast"
import Modal from "react-modal"
import {useTranslation} from "next-i18next"
import {useRouter} from "next/router"
import {getEndpoint} from "@/utils/app/api"
import {RESPONSE_TIMEOUT_MS, TOAST_DURATION_MS} from "@/utils/app/const"
import {saveConversationsHistory, saveSelectedConversation} from "@/utils/app/conversations"
import {generateFilename} from "@/utils/app/filename"
import {throttle} from "@/utils/data/throttle"
import {ChatBody, Conversation, Message} from "@/types/chat"
import {fallbackOpenAIModel} from "@/types/openai"
import {Plugin} from "@/types/plugin"
import HomeContext from "@/pages/api/home/home.context"
import {WelcomeMessage} from "@/components/Chat/WelcomeMessage"
import {MemoizedReactMarkdown} from "@/components/Markdown/MemoizedReactMarkdown"
import Spinner from "../Spinner"
import {ChatInput} from "./ChatInput"
import {ChatLoader} from "./ChatLoader"
import {ErrorMessageDiv} from "./ErrorMessageDiv"
import {MemoizedChatMessage} from "./MemoizedChatMessage"
import {ModelSelect} from "./ModelSelect"
import {toPng} from "html-to-image"
import rehypeMathjax from "rehype-mathjax"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math";


interface Props {
  stopConversationRef: MutableRefObject<boolean>
}

const useMarkdownFile = (filename: string) => {
  const [fileContent, setFileContent] = useState<string | null>(null)

  useEffect(() => {
    fetch(filename)
      .then((response) => response.text())
      .then((text) => setFileContent(text))
      .catch((error) => console.error(`Error fetching markdown file: ${error}`))
  }, [filename])
  return fileContent
}

export const Chat = memo(({stopConversationRef}: Props) => {
  const {t} = useTranslation("chat")

  const {
    state: {
      selectedConversation,
      conversations,
      models,
      apiKey,
      unlockCode,
      pluginKeys,
      serverSideApiKeyIsSet,
      serverSideUnlockCodeIsSet,
      modelError,
      loading
    },
    handleUpdateConversation,
    dispatch: homeDispatch
  } = useContext(HomeContext)

  const [currentMessage, setCurrentMessage] = useState<Message>()
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true)
  const [showSettings, setShowSettings] = useState<boolean>(false)
  const [showScrollDownButton, setShowScrollDownButton] = useState<boolean>(false)
  const [isReleaseNotesDialogOpen, setIsReleaseNotesDialogOpen] = useState<boolean>(false)
  const router = useRouter()
  const releaseNotesMarkdown = useMarkdownFile(`${router.basePath}/RELEASE_NOTES.md`)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const customModalStyles = {
    content: {
      backgroundColor: "#e6e6e0",
      color: "#000000",
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      padding: "2rem",
      maxWidth: "50%",
      maxHeight: "80%",
      overflow: "auto"
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)"
    }
  }

  const handleSend = useCallback(
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
            model: updatedConversation.model,
            messages: updatedConversation.messages,
            key: apiKey,
            prompt: updatedConversation.prompt,
            temperature: updatedConversation.temperature
          }
          const endpoint = getEndpoint(plugin)
          let body
          if (!plugin) {
            body = JSON.stringify(chatBody)
          } else {
            body = JSON.stringify({
              ...chatBody,
              googleAPIKey: pluginKeys
                .find((key) => key.pluginId === "google-search")
                ?.requiredKeys.find((key) => key.key === "GOOGLE_API_KEY")?.value,
              googleCSEId: pluginKeys
                .find((key) => key.pluginId === "google-search")
                ?.requiredKeys.find((key) => key.key === "GOOGLE_CSE_ID")?.value
            })
          }
          const controller = new AbortController()

          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(unlockCode && {Authorization: `Bearer ${unlockCode}`})
            },
            body
          })

          if (!response.ok) {
            homeDispatch({field: "loading", value: false})
            homeDispatch({field: "messageIsStreaming", value: false})
            let errorText = await response.text()
            console.log(
              `HTTP response, statusText:${response.statusText}, status:${response.status}, errorText: ${errorText}, headers:${response.headers}`
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
          const data = plugin ? await response.json() : response.body?.getReader()
          if (!data) {
            homeDispatch({field: "loading", value: false})
            homeDispatch({field: "messageIsStreaming", value: false})
            return
          }
          if (!plugin) {
            if (updatedConversation.messages.length === 1) {
              const {content} = message
              const customName = content.length > 30 ? content.substring(0, 30) + "..." : content
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
                console.info("Stopped conversation...")
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
        if (error instanceof Error && error.message === "Request timeout") {
          toast.error(`${error}... The server may be busy. Try again later.`, {duration: TOAST_DURATION_MS})
        } else {
          toast.error(`${error}... Please try again later.`, {duration: TOAST_DURATION_MS})
        }
        homeDispatch({field: "loading", value: false})
        homeDispatch({field: "messageIsStreaming", value: false})
        return
      }
    },
    [apiKey, conversations, homeDispatch, pluginKeys, selectedConversation, stopConversationRef, unlockCode]
  )

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const {scrollTop, scrollHeight, clientHeight} = chatContainerRef.current
      const bottomTolerance = 30

      if (scrollTop + clientHeight < scrollHeight - bottomTolerance) {
        setAutoScrollEnabled(false)
        setShowScrollDownButton(true)
      } else {
        setAutoScrollEnabled(true)
        setShowScrollDownButton(false)
      }
    }
  }

  const handleScrollUp = () => {
    chatContainerRef.current?.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  }

  const handleScrollDown = () => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth"
    })
  }

  const onSettings = () => {
    setIsReleaseNotesDialogOpen(false)
    if (!showSettings) {
      setAutoScrollEnabled(false)
      handleScrollUp()
    } else {
      setAutoScrollEnabled(true)
      handleScrollDown()
    }
    setShowSettings(!showSettings)
  }

  const onClearAll = () => {
    setIsReleaseNotesDialogOpen(false)
    if (confirm(t("Are you sure you want to clear all messages in this conversation?")) && selectedConversation) {
      handleUpdateConversation(selectedConversation, {
        key: "messages",
        value: []
      })
    }
  }

  const scrollDown = () => {
    if (autoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView(true)
    }
  }
  const throttledScrollDown = throttle(scrollDown, 250)

  const onSaveAsScreenshot = () => {
    setIsReleaseNotesDialogOpen(false)
    if (chatContainerRef.current === null) {
      return
    }

    chatContainerRef.current.classList.remove("max-h-full")
    toPng(chatContainerRef.current, {cacheBust: true})
      .then((dataUrl) => {
        const link = document.createElement("a")
        link.download = `${generateFilename("screenshot", "png")}`
        link.href = dataUrl
        link.click()
        if (chatContainerRef.current) {
          chatContainerRef.current.classList.add("max-h-full")
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const onSaveAsMarkdown = () => {
    setIsReleaseNotesDialogOpen(false)
    if (!selectedConversation) {
      return
    }

    let markdownContent = `# ${selectedConversation.name}\n\n(${new Date(
      selectedConversation.time
    ).toLocaleString()})\n\n`
    for (const message of selectedConversation.messages) {
      markdownContent += `## ${message.role.charAt(0).toUpperCase() + message.role.slice(1)}\n\n${message.content}\n\n`
    }

    const url = URL.createObjectURL(new Blob([markdownContent]))
    const link = document.createElement("a")
    link.download = generateFilename("markdown", "md")
    link.href = url
    link.style.display = "none"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const onReleaseNotes = () => {
    setIsReleaseNotesDialogOpen(!isReleaseNotesDialogOpen)
  }

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

  return (
    <div className="relative flex-1 overflow-hidden bg-white dark:bg-[#343541]">
      {modelError ? (
        <ErrorMessageDiv error={modelError} />
      ) : (
        <>
          <div className="max-h-full overflow-x-hidden" ref={chatContainerRef} onScroll={handleScroll}>
            <div className="sticky top-0 z-10 flex justify-center border border-b-neutral-300 bg-neutral-100 py-2 text-sm text-neutral-500 dark:border-none dark:bg-[#444654] dark:text-neutral-200">
              {t("Model")}: {selectedConversation?.model.name}
              &nbsp;&nbsp;&nbsp;|&nbsp;
              <button className="ml-2 cursor-pointer hover:opacity-50" onClick={onReleaseNotes}>
                <IconHelp size={18} />
              </button>
              &nbsp;&nbsp;&nbsp;|&nbsp;
              <button className="ml-2 cursor-pointer hover:opacity-50" onClick={onSettings}>
                <IconRobot size={18} />
              </button>
              <button className="ml-2 cursor-pointer hover:opacity-50" onClick={onClearAll}>
                <IconEraser size={18} />
              </button>
              &nbsp;&nbsp;&nbsp;|&nbsp;
              {selectedConversation ? (
                <button className="ml-2 cursor-pointer hover:opacity-50" onClick={onSaveAsScreenshot}>
                  <IconScreenshot size={18} />
                </button>
              ) : null}
              {selectedConversation ? (
                <button className="ml-2 cursor-pointer hover:opacity-50" onClick={onSaveAsMarkdown}>
                  <IconMarkdown size={18} />
                </button>
              ) : null}
            </div>
            {showSettings && (
              <div className="flex flex-col space-y-10 md:mx-auto md:max-w-xl md:gap-6 md:py-3 md:pt-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
                <div className="flex h-full flex-col space-y-4 border-b border-neutral-200 p-4 dark:border-neutral-600 md:rounded-lg md:border">
                  <ModelSelect />
                </div>
              </div>
            )}

            <>
              {selectedConversation?.messages.length === 0 && <WelcomeMessage />}
              {!serverSideApiKeyIsSet && !apiKey && (
                <div className="text-center text-red-800 dark:text-red-400 mb-2">
                  Please enter the correct Azure OpenAI key in left menu bar of Chatty.
                </div>
              )}
              {serverSideUnlockCodeIsSet && !unlockCode && (
                <div className="text-center text-red-800 dark:text-red-400 mb-2">
                  The application is locked by an <span className="italic">unlock code</span>.
                  <div>Please enter the correct unlock code in left menu bar of Chatty.</div>
                </div>
              )}
              {models.length === 0 && (
                <div className="mx-auto flex flex-col space-y-5 md:space-y-10 px-3 pt-5 md:pt-12 sm:max-w-[600px] text-center font-semibold text-gray-600 dark:text-gray-300">
                  <div>
                    Loading models...
                    <Spinner size="16px" className="mx-auto" />
                  </div>
                </div>
              )}

              {selectedConversation?.messages.map((message, index) => (
                <MemoizedChatMessage
                  key={index}
                  message={message}
                  messageIndex={index}
                  onEdit={(editedMessage) => {
                    setCurrentMessage(editedMessage)
                    // discard edited message and the ones that come after then resend
                    handleSend(editedMessage, selectedConversation?.messages.length - index)
                  }}
                />
              ))}

              {loading && <ChatLoader />}
              <div className="h-[162px] bg-white dark:bg-[#343541]" ref={messagesEndRef} />
            </>
          </div>

          {(serverSideApiKeyIsSet || apiKey) && (!serverSideUnlockCodeIsSet || unlockCode) && models.length > 0 && (
            <ChatInput
              stopConversationRef={stopConversationRef}
              textareaRef={textareaRef}
              model={selectedConversation ? selectedConversation.model : fallbackOpenAIModel}
              onSend={(message, plugin) => {
                setCurrentMessage(message)
                handleSend(message, 0, plugin)
              }}
              onScrollDownClick={handleScrollDown}
              onRegenerate={() => {
                if (currentMessage) {
                  handleSend(currentMessage, 2, null)
                }
              }}
              showScrollDownButton={showScrollDownButton}
            />
          )}
        </>
      )}
      <Modal
        isOpen={isReleaseNotesDialogOpen}
        onRequestClose={() => setIsReleaseNotesDialogOpen(false)}
        style={customModalStyles}
        contentLabel="Release Notes"
        ariaHideApp={false}
      >
        <MemoizedReactMarkdown
          className="prose dark:prose-invert flex-1"
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeMathjax]}
          components={{
            code({node, inline, className, children, ...props}) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              )
            },
            table({children}) {
              return (
                <table className="border-collapse border border-black px-3 py-1 dark:border-white">{children}</table>
              )
            },
            th({children}) {
              return (
                <th className="break-words border border-black bg-gray-500 px-3 py-1 text-white dark:border-white">
                  {children}
                </th>
              )
            },
            td({children}) {
              return <td className="break-words border border-black px-3 py-1 dark:border-white">{children}</td>
            }
          }}
        >
          {`${releaseNotesMarkdown ? releaseNotesMarkdown : `Loading release notes...`}`}
        </MemoizedReactMarkdown>
        <button
          className="h-[40px] rounded-md bg-blue-500 px-4 py-1 text-sm font-medium text-white enabled:hover:bg-blue-600 disabled:opacity-50"
          onClick={() => setIsReleaseNotesDialogOpen(false)}
        >
          Dismiss
        </button>
      </Modal>
    </div>
  )
})

Chat.displayName = "Chat"