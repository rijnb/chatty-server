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

import {IconBulbFilled, IconBulbOff, IconHelp, IconMarkdown, IconScreenshot} from "@tabler/icons-react"
import {useTranslation} from "next-i18next"
import {useTheme} from "next-themes"
import React, {useEffect, useRef, useState} from "react"

import useClickAway from "@/components/Hooks/useClickAway"
import useSaveMarkdown from "@/components/Hooks/useSaveMarkdown"
import useScreenshot from "@/components/Hooks/useScreenshot"
import {FormLabel, FormText, Range, Select} from "@/components/Styled"
import {useHomeContext} from "@/pages/api/home/home.context"
import {Conversation} from "@/types/chat"
import {OpenAIModel, isOpenAiReasoningModel, maxOutputTokensForModel} from "@/types/openai"
import {OPENAI_API_MAX_TOKENS, OPENAI_DEFAULT_SYSTEM_PROMPT, OPENAI_DEFAULT_TEMPERATURE} from "@/utils/app/const"

interface Props {
  conversation: Conversation
  container: React.RefObject<HTMLDivElement>
  models: OpenAIModel[]
  onOpenReleaseNotes: () => void
  onUpdateConversation: (conversation: Conversation) => void
}

const ChatMenu = ({conversation, container, models, onUpdateConversation, onOpenReleaseNotes}: Props) => {
  const {t} = useTranslation("common")

  const {
    state: {defaultModelId, allowModelSelection}
  } = useHomeContext()
  const {theme, setTheme} = useTheme()
  const {onSaveScreenshot} = useScreenshot(container)
  const {onSaveMarkdown} = useSaveMarkdown(conversation)

  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const temperature = conversation.temperature ?? OPENAI_DEFAULT_TEMPERATURE
  const modelId = conversation.modelId ?? defaultModelId
  const maxOutputTokens =
    Math.min(conversation.maxTokens, maxOutputTokensForModel(conversation.modelId)) ?? OPENAI_API_MAX_TOKENS
  const prompt = conversation.prompt ?? OPENAI_DEFAULT_SYSTEM_PROMPT
  const reasoningEffort = conversation.reasoningEffort ?? "low"

  const [openAiReasoningModel, setOpenAiReasoningModel] = useState(isOpenAiReasoningModel(modelId))

  useEffect(() => {
    setOpenAiReasoningModel(isOpenAiReasoningModel(modelId))
  }, [modelId])

  const ref = useRef<HTMLDivElement>(null)

  useClickAway(ref, isMenuOpen, () => {
    setIsMenuOpen(false)
  })

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleTemperatureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    conversation.temperature = Number(event.target.value)
    onUpdateConversation(conversation)
  }

  const handleReasoningEffortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    conversation.reasoningEffort = event.target.value
    onUpdateConversation(conversation)
  }

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    conversation.modelId = e.target.value
    conversation.maxTokens = Math.min(conversation.maxTokens, maxOutputTokensForModel(conversation.modelId))
    onUpdateConversation(conversation)
  }

  const handleMaxTokensChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    conversation.maxTokens = Number(event.target.value)
    onUpdateConversation(conversation)
  }

  const handlePromptChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    conversation.prompt = event.target.value
    onUpdateConversation(conversation)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      setIsMenuOpen(false)
    }
  }

  return (
    <div
      ref={ref}
      className={`fixed left-1/2 top-0 z-50 flex max-w-lg -translate-x-1/2 transform flex-col items-center justify-center rounded-b-lg border-x border-b border-gray-300 bg-gray-50 p-6 transition-all duration-500 ease-in-out dark:border-gray-700 dark:bg-[#343644] ${
        isMenuOpen ? "translate-y-0 shadow-xl " : "-translate-y-full shadow-none"
      }`}
      onKeyDown={handleKeyDown}
    >
      <div className="w-full">
        <div className="flex flex-col">
          <FormLabel htmlFor="model">
            {allowModelSelection ? t("Conversation model") : t("Conversation model (disabled)")}
          </FormLabel>
          <Select
            id="model"
            disabled={!allowModelSelection}
            className="disabled:pointer-events-none disabled:text-gray-300"
            value={modelId}
            onChange={handleModelChange}
          >
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.id}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex flex-col pt-2">
          <FormLabel htmlFor="prompt">System prompt</FormLabel>
          <FormText>
            Enter the system prompt. This prompt precedes the entire conversation and influences the behavior of the
            model.
          </FormText>
          <textarea id="prompt" className="mt-2" rows={6} value={prompt} onChange={handlePromptChange} />
        </div>

        {openAiReasoningModel ? (
          <div className="flex flex-col pt-2">
            <FormLabel htmlFor="reasoningEffort">Reasoning Effort</FormLabel>
            <FormText>
              Choose the reasoning effort level:
              • Low: Fast, concise responses with basic reasoning. • Medium: Balanced answers with clear reasoning. • High: In-depth, step-by-step answers for detailed analysis
            </FormText>
            <Select id="reasoningEffort" className="mt-2" value={reasoningEffort} onChange={handleReasoningEffortChange}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </div>
        ) : (
          <div className="flex flex-col pt-2">
            <FormLabel htmlFor="temperature">Temperature</FormLabel>
            <FormText>
              Higher values means the model will take more risks or be more creative. Try 0 for more predictable answers
              and 1 for more creative ones.
            </FormText>
            <Range
              id="temperature"
              className="mt-2"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={handleTemperatureChange}
            />
            <FormText className="text-center">{temperature}</FormText>
          </div>
        )}

        <div className="flex flex-col pt-2">
          <FormLabel htmlFor="maxTokens">Response token limit</FormLabel>
          <FormText>The maximum number of tokens used to generate an answer.</FormText>
          <Range
            id="maxTokens"
            className="mt-2"
            min="100"
            max={maxOutputTokensForModel(modelId)}
            step="100"
            value={maxOutputTokens}
            onChange={handleMaxTokensChange}
          />
          <FormText className="text-center">{maxOutputTokens}</FormText>
        </div>
      </div>

      <div className="absolute top-full">
        <div className="flex w-full flex-row justify-center rounded-b-lg border border-t-0 border-b-neutral-300 bg-neutral-100 px-4 py-2 text-sm text-neutral-500 shadow dark:border-none dark:bg-[#343644] dark:text-neutral-200">
          <button
            className="cursor-pointer px-2 hover:opacity-50 focus:outline-none "
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title="Toggle dark/light theme"
          >
            {theme === "dark" ? <IconBulbFilled size={18} /> : <IconBulbOff size={18} />}
          </button>

          <button
            className="cursor-pointer px-2 hover:opacity-50 focus:outline-none"
            onClick={onOpenReleaseNotes}
            title="Show help and release notes"
          >
            <IconHelp size={18} />
          </button>

          <button
            className="w-fit rounded-b-lg bg-neutral-200 px-4 text-neutral-500 hover:opacity-50 focus:outline-none dark:border-none dark:bg-[#3c404a] dark:text-neutral-200"
            onClick={toggleMenu}
            title="Change model settings"
          >
            {conversation.modelId}
          </button>

          <button
            className="cursor-pointer px-2 hover:opacity-50 focus:outline-none"
            disabled={!conversation}
            onClick={onSaveScreenshot}
            title="Save conversation as PNG image"
          >
            <IconScreenshot size={18} />
          </button>

          <button
            className="cursor-pointer px-2 hover:opacity-50 focus:outline-none"
            disabled={!conversation}
            onClick={onSaveMarkdown}
            title="Save conversation as Markdown"
          >
            <IconMarkdown size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatMenu
