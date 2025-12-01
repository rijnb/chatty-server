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
import {IconBolt, IconBrandGoogle, IconCameraPlus, IconPlayerStop, IconRepeat, IconSend} from "@tabler/icons-react"
import {useTranslation} from "next-i18next"
import Image from "next/image"
import {useRouter} from "next/router"
import React, {KeyboardEvent, MutableRefObject, useCallback, useEffect, useRef, useState} from "react"

import ChatInputTokenCount from "./ChatInputTokenCount"
import PluginSelect from "./PluginSelect"
import PromptInputVars from "./PromptInputVars"
import PromptPopupList from "./PromptPopupList"
import {useHomeContext} from "@/pages/api/home/home.context"
import {Message, MessagePart} from "@/types/chat"
import {Plugin} from "@/types/plugin"
import {Prompt} from "@/types/prompt"
import {isKeyboardEnter} from "@/utils/app/keyboard"
import {TiktokenEncoder} from "@/utils/server/tiktoken"

interface Props {
  modelId: string
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
  const [promptVariables, setPromptVariables] = useState<string[]>([])
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

  function escapeRegExChar(string: string) {
    return string.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&")
  }

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
      const upperCaseInputRegex = upperCaseInput
        .split("")
        .map((char) => `${escapeRegExChar(char)}.*?`)
        .join("")
      if (RegExp(upperCaseInputRegex).exec(upperCasePromptNameChars)) {
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

  const addImageToPrompt = (file: File) => {
    const images = document.getElementById("images")
    if (!images) {
      console.error("HTML element not found: thumbnails")
      return
    }

    // Create a container for each image and its delete button.
    const container = document.createElement("div")
    container.style.position = "relative"
    container.style.display = "inline-block" // Allows multiple thumbnails side by side

    // Create an image element.
    const img = document.createElement("img")
    img.src = URL.createObjectURL(file)

    // Create a delete button with an icon.
    const deleteButton = document.createElement("button")
    deleteButton.innerHTML = "&#x274C;" // Using a Unicode character for simplicity.
    deleteButton.style.position = "absolute"
    deleteButton.style.top = "0"
    deleteButton.style.right = "0"
    deleteButton.style.border = "none"
    deleteButton.style.background = "transparent"
    deleteButton.style.cursor = "pointer"

    // Append the image and delete button to the container.
    container.appendChild(img)
    container.appendChild(deleteButton)

    // Append the container to the thumbnail element.
    images.appendChild(container)

    // Delete functionality.
    deleteButton.onclick = () => {
      if (images && container) {
        images.removeChild(container)
      }
    }
  }

  const handleBrowseFile = () => {
    if (messageIsStreaming || !encoder || !selectedConversation || !models) {
      return
    }

    const fileInput = document.createElement("input")
    fileInput.type = "file"
    fileInput.accept = "image/*"
    fileInput.multiple = true
    fileInput.onchange = () => {
      if (fileInput.files === null) {
        return
      }
      if (fileInput.files.length > 0) {
        for (const file of fileInput.files) {
          addImageToPrompt(file)
        }
      }
    }
    fileInput.click()
  }

  const handleSendMessage = () => {
    const imagesElement = document.getElementById("images")
    const images = imagesElement ? imagesElement.getElementsByTagName("img") : undefined
    if (
      messageIsStreaming ||
      (!content && (!images || images.length === 0)) ||
      !encoder ||
      !selectedConversation ||
      !models
    ) {
      return
    }
    const messageContent: MessagePart[] = [
      {
        type: "text",
        text: content ? content.replace(/[\x00-\x1F]/g, ".").replace(/\s+$/, "").replace(/\n{3,}/g, "\n\n") : ""
      }
    ]
    if (modelId.includes("gpt-4o")) {
      if (images && images.length > 0) {
        for (const img of images) {
          const canvas = document.createElement("canvas")
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.drawImage(img, 0, 0, img.width, img.height)
            const dataURL = canvas.toDataURL("image/jpeg", 0.8)
            messageContent.push({type: "image_url", image_url: {url: dataURL}})
          }
        }
      }
    }
    if (imagesElement) {
      imagesElement.innerHTML = ""
    }
    const message: Message = {role: "user", content: messageContent}
    onSend(message, plugin)
    setContent("")
    setPlugin(null)

    if (window.innerWidth < 640 && textareaRef?.current) {
      textareaRef.current.blur()
    }
  }

  const handleStopOngoingConversation = () => {
    stopConversationRef.current = true
    setTimeout(() => {
      stopConversationRef.current = false
    }, 3000)
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items
    for (const item of items) {
      if (item.kind === "file" && item.type.startsWith("image/")) {
        const file = item.getAsFile()
        if (file) {
          addImageToPrompt(file)
        }
      }
    }
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
    } else if (isKeyboardEnter(e) && !isTyping && !(e.shiftKey || e.altKey)) {
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
      const index = promptVariables.indexOf(promptVariable)
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
    <div
      className="absolute bottom-0 left-0 w-full border-transparent bg-gradient-to-b from-transparent via-white to-white pt-2 dark:border-white/20 dark:via-[#343541] dark:to-[#343541]"
      style={{width: "calc(100% - 10px)"}}
    >
      <div className="flex items-center justify-center" id="images"></div>
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

        <div
          className="relative mx-4 flex w-full flex-grow flex-col rounded-md border border-black/10 bg-white shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:border-gray-900/50 dark:bg-[#40414F] dark:text-white dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]">
          <button
            className="absolute left-2 top-2 rounded-sm p-1 text-neutral-800 opacity-60 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-opacity-50 dark:text-neutral-100 dark:hover:text-neutral-200"
            onClick={() => setShowPluginSelect(!showPluginSelect)}
            title=" Select plug-in for query"
          >
            {plugin ? <IconBrandGoogle size={20} /> : <IconBolt size={20} />}
          </button>
          {showPluginSelect && (
            <div className="absolute bottom-14 left-0 rounded bg-white dark:bg-[#343541]">
              <PluginSelect plugin={plugin} onKeyDown={handlePlugInKeyDown()} onPluginChange={handlePlugInChange()} />
            </div>
          )}
          <button
            data-testid="browse-file"
            aria-label="Browse file"
            disabled={disabled || !modelId.includes("gpt-4o")}
            className="absolute left-8 top-2 rounded-sm p-1 text-neutral-800 opacity-60 hover:bg-neutral-200 hover:text-neutral-900 disabled:pointer-events-none disabled:text-gray-300 dark:bg-opacity-50 dark:text-neutral-100 dark:hover:text-neutral-200 dark:disabled:text-gray-600"
            onClick={handleBrowseFile}
            title="Browse file"
          >
            {messageIsStreaming ? (
              <div
                className="h-4 w-4 animate-spin rounded-full border-t-2 border-neutral-800 opacity-60 dark:border-neutral-100"></div>
            ) : (
              <IconCameraPlus size={18} />
            )}
          </button>
          <div className="pointer-events-none absolute bottom-full mx-auto mb-2 flex w-full justify-end">
            <ChatInputTokenCount
              content={content}
              inputTokenLimit={models.find((model) => model.id === modelId)?.inputTokenLimit ?? 4096}
            />
          </div>
          <textarea
            data-testid="chat-input"
            ref={textareaRef}
            disabled={disabled}
            className="m-0 w-full resize-none border-0 bg-transparent p-0 py-3 pl-10 pr-8 text-black dark:bg-transparent dark:text-white"
            style={{
              resize: "none",
              bottom: `${textareaRef?.current?.scrollHeight}px`,
              maxHeight: "400px",
              overflow: `${textareaRef.current && textareaRef.current.scrollHeight > 400 ? "auto" : "hidden"}`,
              paddingLeft: "60px"
            }}
            placeholder={
              disabled
                ? t("Please wait {{waitTime}} seconds", {waitTime: retryAfter})
                : prompts.length > 0
                  ? t("Type a message or type \"/\" and some characters to search for a prompt...")
                  : t("Type a message...")
            }
            value={content}
            rows={1}
            onCompositionStart={() => setIsTyping(true)}
            onCompositionEnd={() => setIsTyping(false)}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
          />
          <button
            data-testid="chat-send"
            aria-label="Send message"
            disabled={disabled}
            className="absolute right-2 top-2 rounded-sm p-1 text-neutral-800 opacity-60 hover:bg-neutral-200 hover:text-neutral-900 disabled:pointer-events-none disabled:text-gray-300 dark:bg-opacity-50 dark:text-neutral-100 dark:hover:text-neutral-200 dark:disabled:text-gray-600"
            onClick={handleSendMessage}
            title="Send query"
          >
            {messageIsStreaming ? (
              <div
                className="h-4 w-4 animate-spin rounded-full border-t-2 border-neutral-800 opacity-60 dark:border-neutral-100"></div>
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
              promptVariables={promptVariables}
              onSubmit={handlePromptSubmit}
              onCancel={handlePromptCancel}
            />
          )}
        </div>
      </div>
      <div
        className="flex items-center justify-center px-4 pb-1 pt-3 text-center text-[12px] text-black/50 dark:text-white/50">
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
          report a problem (or request a feature)
        </a>
      </div>
    </div>
  )
}

export default ChatInput
