import {IconBolt, IconBrandGoogle, IconPlayerStop, IconRepeat, IconSend} from "@tabler/icons-react"
import {useTranslation} from "next-i18next"
import Image from "next/image"
import {useRouter} from "next/router"
import React, {KeyboardEvent, MutableRefObject, useCallback, useEffect, useRef, useState} from "react"

import ChatInputTokenCount from "./ChatInputTokenCount"
import PluginSelect from "./PluginSelect"
import PromptInputVars from "./PromptInputVars"
import PromptPopupList from "./PromptPopupList"
import {useHomeContext} from "@/pages/api/home/home.context"
import {Message} from "@/types/chat"
import {OpenAIModelID} from "@/types/openai"
import {Plugin} from "@/types/plugin"
import {Prompt} from "@/types/prompt"
import {isKeyboardEnter} from "@/utils/app/keyboard"
import {TiktokenEncoder} from "@/utils/server/tiktoken"

interface Props {
  modelId: OpenAIModelID
  onSend: (message: Message, plugin: Plugin | null) => void
  onRegenerate: () => void
  stopConversationRef: MutableRefObject<boolean>
  textareaRef: MutableRefObject<HTMLTextAreaElement | null>
  retryAfter: number | null
}

export const ChatInput = ({modelId, onSend, onRegenerate, stopConversationRef, textareaRef, retryAfter}: Props) => {
  const {t} = useTranslation("common")
  const router = useRouter()
  const {
    state: {models, selectedConversation, messageIsStreaming, prompts, triggerSelectedPrompt},
    dispatch: homeDispatch
  } = useHomeContext()

  const disabled = retryAfter !== null

  const [content, setContent] = useState<string>()
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const [showPromptList, setShowPromptList] = useState(false)
  const [activePromptIndex, setActivePromptIndex] = useState(0)
  const [promptInputValue, setPromptInputValue] = useState("")
  const [variables, setPromptVariables] = useState<string[]>([])
  const [isInputVarsModalVisible, setIsInputVarsModalVisible] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt>()
  const [showPluginSelect, setShowPluginSelect] = useState(false)
  const [plugin, setPlugin] = useState<Plugin | null>(null)
  const [encoder, setEncoder] = useState<TiktokenEncoder | null>(null)

  useEffect(() => {
    const initToken = async () => {
      let encoder = await TiktokenEncoder.create()
      setEncoder(encoder)
    }
    // noinspection JSIgnoredPromiseFromCall
    initToken()
  }, [])

  useEffect(() => {
    if (triggerSelectedPrompt) {
      setSelectedPrompt(triggerSelectedPrompt)
      showInputVarsForPrompt(triggerSelectedPrompt)
    }
    homeDispatch({field: "triggerSelectedPrompt", value: undefined})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerSelectedPrompt])

  const promptListRef = useRef<HTMLUListElement | null>(null)
  const lowerCaseInput = promptInputValue.toLowerCase()
  const allFilteredPrompts = prompts.reduce((acc: Prompt[], prompt) => {
    const lowerCasePromptName = prompt.name.toLowerCase()

    // Check if the string contains the input value (case-insensitive).
    if (lowerCasePromptName.includes(lowerCaseInput)) {
      acc.push(prompt)
    } else {
      // Check if the prompt name matches the start-of-word characters in promptInputValue.
      const upperCaseInput = promptInputValue.toUpperCase()
      const upperCasePromptNameChars = prompt.name
        .split(/[^A-Za-z]/)
        .filter((word) => word.length > 0)
        .map((word) => word[0].toUpperCase())
        .join("")
      if (upperCaseInput && upperCasePromptNameChars.includes(upperCaseInput)) {
        acc.push(prompt)
      }
    }
    return acc
  }, [])
  const filteredPrompts = Array.from(new Set(allFilteredPrompts))

  const parsePromptVariables = (content: string) => {
    const regex = /{{(.*?)}}/g // Match non-greedy, because there may be multiple variables in a prompt.
    const foundPromptVariables = []
    let match
    while ((match = regex.exec(content)) !== null) {
      foundPromptVariables.push(match[1]) // match[0] is the full match, match[1] is the first group.
    }
    return foundPromptVariables
  }

  const updatePromptListVisibility = useCallback((text: string) => {
    const match = /^\/(.*)$/.exec(text)
    if (match) {
      setShowPromptList(true)
      setPromptInputValue(match[0].slice(1))
    } else {
      setShowPromptList(false)
      setPromptInputValue("")
    }
  }, [])

  const showInputVarsForPrompt = (selectedPrompt: Prompt) => {
    const parsedPromptVariables = parsePromptVariables(selectedPrompt.content)
    setPromptVariables(parsedPromptVariables)
    setContent(selectedPrompt.content)
    if (parsedPromptVariables.length > 0) {
      setIsInputVarsModalVisible(true)
    } else {
      updatePromptListVisibility(selectedPrompt.content)
    }
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
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
    if (!content || !encoder || !selectedConversation || !models) {
      return
    }

    // Show an alert and bail out early if we're using too many tokens.
    const message: Message = {role: "user", content: removeSuperfluousWhitespace(content)}
    onSend(message, plugin)
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
        e.stopPropagation() // Prevent the modal dialog to immediately close.
        handleSelectPrompt()
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

  const handleSelectPrompt = () => {
    const selectedPrompt = filteredPrompts[activePromptIndex]
    setSelectedPrompt(selectedPrompt)
    setShowPromptList(false)
    if (selectedPrompt) {
      showInputVarsForPrompt(selectedPrompt)
    }
  }

  const handlePromptSubmit = (updatedPromptVariables: string[]) => {
    setIsInputVarsModalVisible(false)
    const newContent = content?.replace(/{{(.*?)}}/g, (match, promptVariable) => {
      const index = variables.indexOf(promptVariable)
      return updatedPromptVariables[index]
    })
    setContent(newContent)
    if (textareaRef?.current) {
      textareaRef.current.focus()
    }
  }

  const handlePromptCancel = () => {
    setIsInputVarsModalVisible(false)
    setContent("")
    if (textareaRef?.current) {
      textareaRef.current.focus()
    }
  }

  const handlePlugInKeyDown = () => {
    return (e: any) => {
      if (e.key === "Escape") {
        e.preventDefault()
        setShowPluginSelect(false)
        textareaRef.current?.focus()
      }
    }
  }

  const handlePlugInChange = () => {
    return (plugin: Plugin) => {
      setPlugin(plugin)
      setShowPluginSelect(false)
      if (textareaRef?.current) {
        textareaRef.current.focus()
      }
    }
  }

  useEffect(() => {
    if (promptListRef.current) {
      promptListRef.current.scrollTop = activePromptIndex * 36
    }
  }, [activePromptIndex])

  useEffect(() => {
    if (textareaRef?.current) {
      textareaRef.current.style.height = "inherit"
      textareaRef.current.style.height = `${textareaRef.current?.scrollHeight}px`
      textareaRef.current.style.overflow = `${textareaRef?.current?.scrollHeight > 400 ? "auto" : "hidden"}`
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            disabled={disabled}
            className="absolute left-0 right-0 top-0 mx-auto mb-0 mt-2 flex w-fit items-center gap-3 rounded border border-neutral-200 bg-white px-4 py-2 text-black hover:opacity-50 disabled:pointer-events-none disabled:text-gray-300 dark:border-neutral-600 dark:bg-[#343541] dark:text-white dark:disabled:text-gray-600"
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
              <PluginSelect plugin={plugin} onKeyDown={handlePlugInKeyDown()} onPluginChange={handlePlugInChange()} />
            </div>
          )}
          <div className="pointer-events-none absolute bottom-full mx-auto mb-2 flex w-full justify-end">
            <ChatInputTokenCount
              content={content}
              tokenLimit={models.find((model) => model.id === modelId)?.tokenLimit}
            />
          </div>
          <textarea
            ref={textareaRef}
            disabled={disabled}
            className="m-0 w-full resize-none border-0 bg-transparent p-0 py-3 pl-10 pr-8 text-black dark:bg-transparent dark:text-white"
            style={{
              resize: "none",
              bottom: `${textareaRef?.current?.scrollHeight}px`,
              maxHeight: "400px",
              overflow: `${textareaRef.current && textareaRef.current.scrollHeight > 400 ? "auto" : "hidden"}`
            }}
            placeholder={
              disabled
                ? t("Please wait {{waitTime}} seconds", {waitTime: retryAfter})
                : prompts.length > 0
                ? t('Type a message or type "/" and some characters to search for a prompt...')
                : t("Type a message...")
            }
            value={content}
            rows={1}
            onCompositionStart={() => setIsTyping(true)}
            onCompositionEnd={() => setIsTyping(false)}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
          />
          <button
            aria-label="Send message"
            disabled={disabled}
            className="absolute right-2 top-2 rounded-sm p-1 text-neutral-800 opacity-60 hover:bg-neutral-200 hover:text-neutral-900 disabled:pointer-events-none disabled:text-gray-300 dark:bg-opacity-50 dark:text-neutral-100 dark:hover:text-neutral-200 dark:disabled:text-gray-600"
            onClick={handleSendMessage}
          >
            {messageIsStreaming ? (
              <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-neutral-800 opacity-60 dark:border-neutral-100"></div>
            ) : (
              <IconSend size={18} />
            )}
          </button>
          {showPromptList && filteredPrompts.length > 0 && (
            <div className="absolute bottom-12 w-full">
              <PromptPopupList
                prompts={filteredPrompts}
                activePromptIndex={activePromptIndex}
                onSelect={handleSelectPrompt}
                onMouseOver={setActivePromptIndex}
                promptListRef={promptListRef}
              />
            </div>
          )}
          {isInputVarsModalVisible && selectedPrompt && (
            <PromptInputVars
              prompt={selectedPrompt}
              promptVariables={variables}
              onSubmit={handlePromptSubmit}
              onCancel={handlePromptCancel}
            />
          )}
        </div>
      </div>
      <div className="flex items-center justify-center px-4 pb-6 pt-3 text-center text-[12px] text-black/50 dark:text-white/50">
        <a href="https://github.com/rijnb/chatty-server" target="_blank" rel="noreferrer" className="underline">
          Chatty
        </a>
        &nbsp;was developed by Rijn Buve and Oleksii Kulyk
        <Image src={`${router.basePath}/icon-16.png`} height="16" width="16" alt="icon" className="mx-2" />
        <a
          href="https://github.com/rijnb/chatty-server/issues/new?title=Describe%20problem%20or%20feature%20request%20here...%20&body=Provide%20steps%20to%20reproduce%20the%20problem%20here..."
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          report a problem
        </a>
      </div>
    </div>
  )
}

export default ChatInput
