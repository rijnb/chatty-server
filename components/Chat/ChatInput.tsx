import {IconArrowDown, IconBolt, IconBrandGoogle, IconPlayerStop, IconRepeat, IconSend} from "@tabler/icons-react"
import React, {KeyboardEvent, MutableRefObject, useCallback, useContext, useEffect, useRef, useState} from "react"
import {useTranslation} from "next-i18next"
import {isKeyboardEnter} from "@/utils/app/keyboard"
import {Message} from "@/types/chat"
import {OpenAIModel} from "@/types/openai"
import {Plugin} from "@/types/plugin"
import {Prompt} from "@/types/prompt"
import HomeContext from "@/pages/api/home/home.context"
import ChatInputTokenCount from "./ChatInputTokenCount"
import PluginSelect from "./PluginSelect"
import PromptInputVars from "./PromptInputVars"
import PromptPopupList from "./PromptPopupList"


interface Props {
  model: OpenAIModel
  onSend: (message: Message, plugin: Plugin | null) => void
  onRegenerate: () => void
  onScrollDownClick: () => void
  stopConversationRef: MutableRefObject<boolean>
  textareaRef: MutableRefObject<HTMLTextAreaElement | null>
  showScrollDownButton: boolean
}

export const ChatInput = ({
  model,
  onSend,
  onRegenerate,
  onScrollDownClick,
  stopConversationRef,
  textareaRef,
  showScrollDownButton
}: Props) => {
  const {t} = useTranslation("chat")

  const {
    state: {selectedConversation, messageIsStreaming, prompts}
  } = useContext(HomeContext)

  const [content, setContent] = useState<string>()
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const [showPromptList, setShowPromptList] = useState(false)
  const [activePromptIndex, setActivePromptIndex] = useState(0)
  const [promptInputValue, setPromptInputValue] = useState("")
  const [variables, setPromptVariables] = useState<string[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [showPluginSelect, setShowPluginSelect] = useState(false)
  const [plugin, setPlugin] = useState<Plugin | null>(null)

  const promptListRef = useRef<HTMLUListElement | null>(null)

  const filteredPrompts = prompts.filter((prompt) => prompt.name.toLowerCase().includes(promptInputValue.toLowerCase()))

  const parsePromptVariables = (content: string) => {
    const regex = /{{(.*?)}}/g
    const foundPromptVariables = []
    let match

    while ((match = regex.exec(content)) !== null) {
      foundPromptVariables.push(match[1])
    }

    return foundPromptVariables
  }

  const updatePromptListVisibility = useCallback((text: string) => {
    const match = text.match(/^\/(.*)$/)

    if (match) {
      setShowPromptList(true)
      setPromptInputValue(match[0].slice(1))
    } else {
      setShowPromptList(false)
      setPromptInputValue("")
    }
  }, [])

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const maxLength = selectedConversation?.model.maxLength

    if (maxLength && value.length > maxLength) {
      alert(
        t(`Message limit is {{maxLength}} characters. You have entered {{valueLength}} characters.`, {
          maxLength,
          valueLength: value.length
        })
      )
      return
    }

    setContent(value)
    updatePromptListVisibility(value)
  }

  const handleSendMessage = () => {
    function removeSuperfluousWhitespace(content: string) {
      // Remove trailing whitespace and consecutive newlines.
      return content.replace(/\s+$/, "").replace(/\n{3,}/g, "\n\n")
    }

    if (messageIsStreaming) {
      return
    }
    if (!content) {
      return
    }

    onSend({role: "user", content: removeSuperfluousWhitespace(content)}, plugin)
    setContent("")
    setPlugin(null)

    if (window.innerWidth < 640 && textareaRef && textareaRef.current) {
      textareaRef.current.blur()
    }
  }

  const handleStopOngoingConversation = () => {
    stopConversationRef.current = true
    setTimeout(() => {
      stopConversationRef.current = false
    }, 3000)
  }

  const handleInitializeModal = () => {
    const selectedPrompt = filteredPrompts[activePromptIndex]
    if (selectedPrompt) {
      setContent((prevContent) => {
        return prevContent?.replace(/\/\w*$/, selectedPrompt.content)
      })
      handlePromptSelect(selectedPrompt)
    }
    setShowPromptList(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showPromptList) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setActivePromptIndex((prevIndex) => (prevIndex < filteredPrompts.length - 1 ? prevIndex + 1 : prevIndex))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setActivePromptIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex))
      } else if (e.key === "Tab") {
        e.preventDefault()
        setActivePromptIndex((prevIndex) => (prevIndex < filteredPrompts.length - 1 ? prevIndex + 1 : 0))
      } else if (isKeyboardEnter(e)) {
        e.preventDefault()
        handleInitializeModal()
      } else if (e.key === "Escape") {
        e.preventDefault()
        setShowPromptList(false)
      } else {
        setActivePromptIndex(0)
      }
    } else if (isKeyboardEnter(e) && !isTyping && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    } else if (e.key === "/" && e.metaKey) {
      e.preventDefault()
      setShowPluginSelect(!showPluginSelect)
    } else if (e.key === "Escape") {
      e.preventDefault()
      setContent("")
    }
  }

  const handlePromptSelect = (prompt: Prompt) => {
    const parsedPromptVariables = parsePromptVariables(prompt.content)
    setPromptVariables(parsedPromptVariables)

    if (parsedPromptVariables.length > 0) {
      setIsModalVisible(true)
    } else {
      setContent((prevContent) => {
        return prevContent?.replace(/\/\w*$/, prompt.content)
      })
      updatePromptListVisibility(prompt.content)
    }
  }

  const handlePromptSubmit = (updatedPromptVariables: string[]) => {
    const newContent = content?.replace(/{{(.*?)}}/g, (match, promptVariable) => {
      const index = variables.indexOf(promptVariable)
      return updatedPromptVariables[index]
    })

    setContent(newContent)
    if (textareaRef && textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const handlePromptCancel = () => {
    setIsModalVisible(false)
    setContent("")
    if (textareaRef && textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  useEffect(() => {
    if (promptListRef.current) {
      promptListRef.current.scrollTop = activePromptIndex * 36
    }
  }, [activePromptIndex])

  useEffect(() => {
    if (textareaRef && textareaRef.current) {
      textareaRef.current.style.height = "inherit"
      textareaRef.current.style.height = `${textareaRef.current?.scrollHeight}px`
      textareaRef.current.style.overflow = `${textareaRef?.current?.scrollHeight > 400 ? "auto" : "hidden"}`
    }
  }, [content])

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (promptListRef.current && !promptListRef.current.contains(e.target as Node)) {
        setShowPromptList(false)
      }
    }
    window.addEventListener("click", handleOutsideClick)
    return () => {
      window.removeEventListener("click", handleOutsideClick)
    }
  }, [])

  return (
    <div className="absolute bottom-0 left-0 w-full border-transparent bg-gradient-to-b from-transparent via-white to-white pt-2 dark:border-white/20 dark:via-[#343541] dark:to-[#343541]">
      <div className="stretch bottom-0 mx-auto mt-[52px] flex max-w-3xl flex-row gap-3 last:mb-6">
        {messageIsStreaming && (
          <button
            className="absolute left-0 right-0 top-0 mx-auto mb-0 mt-2 flex w-fit items-center gap-3 rounded border border-neutral-200 bg-white px-4 py-2 text-black hover:opacity-50 dark:border-neutral-600 dark:bg-[#343541] dark:text-white"
            onClick={handleStopOngoingConversation}
          >
            <IconPlayerStop size={16} /> {t("Stop generating")}
          </button>
        )}

        {!messageIsStreaming && selectedConversation && selectedConversation.messages.length > 0 && (
          <button
            className="absolute left-0 right-0 top-0 mx-auto mb-0 mt-2 flex w-fit items-center gap-3 rounded border border-neutral-200 bg-white px-4 py-2 text-black hover:opacity-50 dark:border-neutral-600 dark:bg-[#343541] dark:text-white"
            onClick={onRegenerate}
          >
            <IconRepeat size={16} /> {t("Regenerate response")}
          </button>
        )}

        <div className="relative mx-4 flex w-full flex-grow flex-col rounded-md border border-black/10 bg-white shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:border-gray-900/50 dark:bg-[#40414F] dark:text-white dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]">
          <button
            className="absolute left-2 top-2 rounded-sm p-1 text-neutral-800 opacity-60 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-opacity-50 dark:text-neutral-100 dark:hover:text-neutral-200"
            onClick={() => setShowPluginSelect(!showPluginSelect)}
          >
            {plugin ? <IconBrandGoogle size={20} /> : <IconBolt size={20} />}
          </button>

          {showPluginSelect && (
            <div className="absolute bottom-14 left-0 rounded bg-white dark:bg-[#343541]">
              <PluginSelect
                plugin={plugin}
                onKeyDown={(e: any) => {
                  if (e.key === "Escape") {
                    e.preventDefault()
                    setShowPluginSelect(false)
                    textareaRef.current?.focus()
                  }
                }}
                onPluginChange={(plugin: Plugin) => {
                  setPlugin(plugin)
                  setShowPluginSelect(false)

                  if (textareaRef && textareaRef.current) {
                    textareaRef.current.focus()
                  }
                }}
              />
            </div>
          )}

          <div className="pointer-events-none absolute bottom-full mx-auto mb-4 flex w-full justify-end">
            <ChatInputTokenCount content={content} tokenLimit={model.tokenLimit} />
          </div>

          <textarea
            ref={textareaRef}
            className="m-0 w-full resize-none border-0 bg-transparent p-0 py-3 pl-10 pr-8 text-black dark:bg-transparent dark:text-white"
            style={{
              resize: "none",
              bottom: `${textareaRef?.current?.scrollHeight}px`,
              maxHeight: "400px",
              overflow: `${textareaRef.current && textareaRef.current.scrollHeight > 400 ? "auto" : "hidden"}`
            }}
            placeholder={
              prompts.length > 0 ? t('Type a message or type "/" to select a prompt...') : t("Type a message...")
            }
            value={content}
            rows={1}
            onCompositionStart={() => setIsTyping(true)}
            onCompositionEnd={() => setIsTyping(false)}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
          />

          <button
            className="absolute right-2 top-2 rounded-sm p-1 text-neutral-800 opacity-60 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-opacity-50 dark:text-neutral-100 dark:hover:text-neutral-200"
            onClick={handleSendMessage}
          >
            {messageIsStreaming ? (
              <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-neutral-800 opacity-60 dark:border-neutral-100"></div>
            ) : (
              <IconSend size={18} />
            )}
          </button>

          {showScrollDownButton && (
            <div className="absolute bottom-12 right-0 lg:-right-10 lg:bottom-0">
              <button
                className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-300 text-gray-800 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-neutral-200"
                onClick={onScrollDownClick}
              >
                <IconArrowDown size={18} />
              </button>
            </div>
          )}

          {showPromptList && filteredPrompts.length > 0 && (
            <div className="absolute bottom-12 w-full">
              <PromptPopupList
                activePromptIndex={activePromptIndex}
                prompts={filteredPrompts}
                onSelect={handleInitializeModal}
                onMouseOver={setActivePromptIndex}
                promptListRef={promptListRef}
              />
            </div>
          )}

          {isModalVisible && (
            <PromptInputVars
              prompt={filteredPrompts[activePromptIndex]}
              promptVariables={variables}
              onSubmit={handlePromptSubmit}
              onCancel={handlePromptCancel}
              onClose={() => setIsModalVisible(false)}
            />
          )}
        </div>
      </div>
      <div className="px-4 pb-6 pt-3 text-center text-[12px] text-black/50 dark:text-white/50">
        <a href="https://github.com/rijnb/chatty-server" target="_blank" className="underline">
          Chatty
        </a>
        &nbsp;was developed by Rijn Buve and Oleksii Kulyk, based on{" "}
        <a href="https://github.com/mckaywrigley/chatbot-ui" target="_blank" className="underline">
          chatbot-ui
        </a>
        &nbsp;by Mckay Wrigley
      </div>
    </div>
  )
}

export default ChatInput