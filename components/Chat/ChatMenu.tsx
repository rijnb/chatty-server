import {IconBulbFilled, IconBulbOff, IconHelp, IconMarkdown, IconScreenshot} from "@tabler/icons-react"
import {useTranslation} from "next-i18next"
import {useTheme} from "next-themes"
import React, {useState} from "react"

import useSaveMarkdown from "@/components/Hooks/useSaveMarkdown"
import useScreenshot from "@/components/Hooks/useScreenshot"
import {Conversation} from "@/types/chat"
import {FALLBACK_OPENAI_MODEL_ID, OpenAIModel, OpenAIModelID, OpenAIModels} from "@/types/openai"
import {OPENAI_API_MAX_TOKENS, OPENAI_DEFAULT_TEMPERATURE} from "@/utils/app/const"

interface Props {
  conversation: Conversation
  container: React.RefObject<HTMLDivElement>
  models: OpenAIModel[]
  onOpenReleaseNotes: () => void
  onUpdateConversation: (conversation: Conversation) => void
}

const ChatMenu = ({conversation, container, models, onUpdateConversation, onOpenReleaseNotes}: Props) => {
  const {t} = useTranslation("common")

  const {theme, setTheme} = useTheme()
  const {onSaveScreenshot} = useScreenshot(container)
  const {onSaveMarkdown} = useSaveMarkdown(conversation)

  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const temperature = conversation.temperature ?? OPENAI_DEFAULT_TEMPERATURE
  const modelId = conversation.modelId ?? FALLBACK_OPENAI_MODEL_ID
  const maxTokens = conversation.maxTokens ?? OPENAI_API_MAX_TOKENS

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleTemperatureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    conversation.temperature = Number(event.target.value)
    onUpdateConversation(conversation)
  }

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    conversation.modelId = e.target.value as OpenAIModelID
    onUpdateConversation(conversation)
  }

  const handleMaxTokensChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    conversation.maxTokens = Number(event.target.value)
    onUpdateConversation(conversation)
  }

  return (
    <div
      className={`fixed left-1/2 top-0 z-50 flex max-w-lg -translate-x-1/2 transform flex-col items-center justify-center transition-all duration-500 ease-in-out ${
        isMenuOpen ? "translate-y-0 shadow-xl " : "-translate-y-full shadow-none"
      }`}
    >
      <div
        className={`dark:border-netural-400 w-full rounded-b-lg border-x border-b border-gray-300 bg-white p-6 dark:bg-[#202123]`}
      >
        <div className="flex flex-col">
          <select
            className="w-full rounded-lg border border-neutral-200 bg-transparent px-2 py-2 text-neutral-900 shadow dark:border-neutral-600 dark:text-white"
            placeholder={t("Select a model")}
            value={modelId}
            onChange={handleModelChange}
          >
            {models.map((model) => (
              <option key={model.id} value={model.id} className="dark:bg-[#343541] dark:text-white">
                {model.id === FALLBACK_OPENAI_MODEL_ID ? `Default (${model.name})` : model.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col pt-2">
          <label htmlFor="temperature" className="text-lg font-medium text-black dark:text-neutral-200">
            Temperature
          </label>
          <span className="text-sm font-medium text-gray-500 dark:text-neutral-300">
            Higher values means the model will take more risks. Try 0.9 for more creative applications, and 0 for ones
            with a well-defined answer.
          </span>
          <input
            id="temperature"
            name="temperature"
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={temperature}
            onChange={handleTemperatureChange}
            className="mt-2 w-full rounded-lg border border-neutral-500 py-2 text-neutral-900 focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-[#40414F] dark:text-neutral-100"
          />
          <span className="text-center text-sm text-gray-500 dark:text-neutral-300">{temperature}</span>
        </div>

        <div className="flex flex-col">
          <label htmlFor="maxTokens" className="text-lg font-medium text-black dark:text-neutral-200">
            Response Token Limit
          </label>
          <span className="text-sm font-medium text-gray-500 dark:text-neutral-300">
            The maximum number of tokens to generate in the completion
          </span>
          <input
            id="maxTokens"
            name="maxTokens"
            type="number"
            min="0"
            max={OpenAIModels[modelId].tokenLimit}
            value={maxTokens}
            onChange={handleMaxTokensChange}
            className="mt-2 w-fit rounded-lg border border-neutral-200 px-4 py-2 text-neutral-900 shadow focus:outline-none dark:border-neutral-600 dark:text-white"
          />
        </div>
      </div>

      <div className="absolute top-full">
        <div className="flex w-full flex-row justify-center rounded-b-lg border border-t-0 border-b-neutral-300 bg-neutral-100 px-4 py-2 text-sm text-neutral-500 shadow dark:border-none dark:bg-[#444654] dark:text-neutral-200">
          <button
            className="cursor-pointer px-2 hover:opacity-50 focus:outline-none "
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <IconBulbFilled size={18} /> : <IconBulbOff size={18} />}
          </button>

          <button className="cursor-pointer px-2 hover:opacity-50 focus:outline-none" onClick={onOpenReleaseNotes}>
            <IconHelp size={18} />
          </button>

          <button
            className="w-fit rounded-b-lg bg-neutral-100 px-4 text-neutral-500 hover:opacity-50 focus:outline-none dark:border-none dark:bg-[#444654] dark:text-neutral-200"
            onClick={toggleMenu}
          >
            {conversation.modelId}
          </button>

          <button
            className="cursor-pointer px-2 hover:opacity-50 focus:outline-none"
            disabled={!conversation}
            onClick={onSaveScreenshot}
          >
            <IconScreenshot size={18} />
          </button>

          <button
            className="cursor-pointer px-2 hover:opacity-50 focus:outline-none"
            disabled={!conversation}
            onClick={onSaveMarkdown}
          >
            <IconMarkdown size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatMenu
