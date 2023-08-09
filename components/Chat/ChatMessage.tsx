import {IconCheck, IconCopy, IconEdit, IconRobot, IconTrash, IconUser} from "@tabler/icons-react"
import React, {FC, memo, useContext, useEffect, useRef, useState} from "react"
import {useTranslation} from "next-i18next"
import {updateConversationHistory} from "@/utils/app/conversations"
import {isKeyboardEnter} from "@/utils/app/keyboard"
import {trimForPrivacy} from "@/utils/app/privacy"
import {Message, equals} from "@/types/chat"
import HomeContext from "@/pages/api/home/home.context"
import {CodeBlock} from "../Markdown/CodeBlock"
import {MemoizedReactMarkdown} from "../Markdown/MemoizedReactMarkdown"
import rehypeMathjax from "rehype-mathjax"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"


export interface Props {
  message: Message
  messageIndex: number
  onEdit?: (editedMessage: Message) => void
}

export const ChatMessage: FC<Props> = memo(({message, messageIndex, onEdit}) => {
  const {t} = useTranslation("chat")

  const {
    state: {selectedConversation, conversations, messageIsStreaming},
    dispatch: homeDispatch
  } = useContext(HomeContext)

  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const [messageContent, setMessageContent] = useState(message.content)
  const [messagedCopied, setMessageCopied] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleToggleEditing = () => {
    setIsEditing(!isEditing)
  }

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageContent(event.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  const handleSaveMessage = () => {
    if (selectedConversation && onEdit) {
      onEdit({...message, content: messageContent})
    }
    setIsEditing(false)
  }

  const handleDeleteMessage = () => {
    if (!selectedConversation) {
      console.info("handleDeleteMessage: No conversation selected")
      return
    }

    const {messages} = selectedConversation
    const findIndex = messages.findIndex((elm) => equals(elm, message))
    if (findIndex < 0) {
      console.info(`handleDeleteMessage: Message not found for: "${trimForPrivacy(message.content)}"`)
      return
    }

    if (messages[findIndex].role === "assistant") {
      messages.splice(findIndex, 1)
    } else {
      if (findIndex < messages.length - 1 && messages[findIndex + 1].role === "assistant") {
        messages.splice(findIndex, 2)
      } else {
        messages.splice(findIndex, 1)
      }
    }

    const updatedConversation = {
      ...selectedConversation,
      messages
    }

    const conversationHistory = updateConversationHistory(updatedConversation, conversations)
    homeDispatch({field: "selectedConversation", value: updatedConversation})
    homeDispatch({field: "conversations", value: conversationHistory})
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isKeyboardEnter(e) && !isTyping && !e.shiftKey) {
      e.preventDefault()
      handleSaveMessage()
    }
  }

  const handleCopyOnClick = () => {
    if (!navigator.clipboard) {
      return
    }

    navigator.clipboard.writeText(message.content).then(() => {
      setMessageCopied(true)
      setTimeout(() => {
        setMessageCopied(false)
      }, 2000)
    })
  }

  useEffect(() => {
    setMessageContent(message.content)
  }, [message.content])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [isEditing])

  return (
    <div
      className={`group md:px-4 ${
        message.role === "assistant"
          ? "border-b border-black/10 bg-gray-50 text-gray-800 dark:border-gray-900/50 dark:bg-[#444654] dark:text-gray-100"
          : "border-b border-black/10 bg-white text-gray-800 dark:border-gray-900/50 dark:bg-[#343541] dark:text-gray-100"
      }`}
      style={{overflowWrap: "anywhere"}}
    >
      <div className="relative m-auto flex p-4 text-base md:max-w-2xl md:gap-6 md:py-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
        <div className="min-w-[40px] text-right font-bold">
          {message.role === "assistant" ? <IconRobot size={30} /> : <IconUser size={30} />}
        </div>

        <div className="prose mt-[-2px] w-full dark:prose-invert">
          {message.role === "user" ? (
            isEditing ? (
              // User message (editing): plain formatted.
              <div className="flex w-full">
                <div className="flex w-full flex-col">
                  <textarea
                    ref={textareaRef}
                    className="w-full resize-none whitespace-pre-line border-none dark:bg-[#343541]"
                    value={messageContent}
                    onChange={handleContentChange}
                    onKeyDown={handleKeyDown}
                    onCompositionStart={() => setIsTyping(true)}
                    onCompositionEnd={() => setIsTyping(false)}
                    style={{
                      fontFamily: "inherit",
                      fontSize: "inherit",
                      lineHeight: "inherit",
                      padding: "0",
                      margin: "0",
                      overflow: "hidden"
                    }}
                  />
                  <div className="mt-10 flex justify-center space-x-4">
                    <button
                      className="h-[40px] rounded-md bg-blue-500 px-4 py-1 text-sm font-medium text-white enabled:hover:bg-blue-600 disabled:opacity-50"
                      onClick={handleSaveMessage}
                      disabled={messageContent.trim().length <= 0}
                    >
                      {t("Save & submit")}
                    </button>
                    <button
                      className="h-[40px] rounded-md border border-neutral-300 px-4 py-1 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      onClick={() => {
                        setMessageContent(message.content)
                        setIsEditing(false)
                      }}
                    >
                      {t("Cancel")}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // User message (not editing): markdown formatted.
              <div className="flex w-full">
                <div className="prose flex-1 whitespace-normal dark:prose-invert">
                  <MemoizedReactMarkdown
                    className="prose flex-1 dark:prose-invert"
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeMathjax]}
                    components={{
                      code({node, inline, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || "")
                        return !inline ? (
                            <CodeBlock
                                key={Math.random()}
                                language={(match && match[1]) || ""}
                                value={String(children).replace(/\n\n$/, "\n")}
                                {...props}
                            />
                        ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                        )
                      },
                      table({children}) {
                        return (
                          <table className="border-collapse border border-black px-3 py-1 dark:border-white">
                            {children}
                          </table>
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
                        return (
                          <td className="break-words border border-black px-3 py-1 dark:border-white">{children}</td>
                        )
                      }
                    }}
                  >
                    {`${message.content}`}
                  </MemoizedReactMarkdown>
                </div>

                {
                  // User message buttons to edit/delete.
                }
                <div className="ml-1 flex flex-col items-center justify-end gap-4 md:-mr-8 md:ml-0 md:flex-row md:items-start md:justify-start md:gap-1">
                  <button
                    className="invisible text-gray-500 hover:text-gray-700 focus:visible group-hover:visible dark:text-gray-400 dark:hover:text-gray-300"
                    onClick={handleToggleEditing}
                  >
                    <IconEdit size={20} />
                  </button>
                  <button
                    className="invisible text-gray-500 hover:text-gray-700 focus:visible group-hover:visible dark:text-gray-400 dark:hover:text-gray-300"
                    onClick={handleDeleteMessage}
                  >
                    <IconTrash size={20} />
                  </button>
                </div>
              </div>
            )
          ) : (
            // Robot response: markdown formatted.
            <div className="flex flex-row">
              <MemoizedReactMarkdown
                className="prose flex-1 dark:prose-invert"
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeMathjax]}
                components={{
                  code({node, inline, className, children, ...props}) {
                    if (children.length) {
                      if (children[0] == "▍") {
                        return <span className="mt-1 animate-pulse cursor-default">▍</span>
                      }
                      children[0] = (children[0] as string).replace("`▍`", "▍")
                    }

                    const match = /language-(\w+)/.exec(className || "")
                    return !inline ? (
                      <CodeBlock
                        key={Math.random()}
                        language={(match && match[1]) || ""}
                        value={String(children).replace(/\n\n$/, "\n")}
                        {...props}
                      />
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    )
                  },
                  table({children}) {
                    return (
                      <table className="border-collapse border border-black px-3 py-1 dark:border-white">
                        {children}
                      </table>
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
                {`${message.content}${
                  messageIsStreaming && messageIndex == (selectedConversation?.messages.length ?? 0) - 1 ? "`▍`" : ""
                }`}
              </MemoizedReactMarkdown>

              {
                // Robot message buttons to edit/delete.
              }
              <div className="ml-1 flex flex-col items-center justify-end gap-4 md:-mr-8 md:ml-0 md:flex-row md:items-start md:justify-start md:gap-1">
                <div className="ml-1 flex flex-col items-center justify-end gap-4 md:-mr-8 md:ml-0 md:flex-row md:items-start md:justify-start md:gap-1">
                  {messagedCopied ? (
                    <IconCheck size={20} className="text-green-500 dark:text-green-400" />
                  ) : (
                    <button
                      className="invisible text-gray-500 hover:text-gray-700 focus:visible group-hover:visible dark:text-gray-400 dark:hover:text-gray-300"
                      onClick={handleCopyOnClick}
                    >
                      <IconCopy size={20} />
                    </button>
                  )}
                  {messageIsStreaming ? (
                    <IconTrash size={20} color={"dark-grey"} />
                  ) : (
                    <button
                      className="invisible text-gray-500 hover:text-gray-700 focus:visible group-hover:visible dark:text-gray-400 dark:hover:text-gray-300"
                      onClick={handleDeleteMessage}
                    >
                      <IconTrash size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

ChatMessage.displayName = "ChatMessage"
export default ChatMessage