import {FC, useEffect, useRef, useState} from "react"

import {useTranslation} from "next-i18next"

import {OPENAI_DEFAULT_SYSTEM_PROMPT} from "@/utils/app/const"

import {Conversation} from "@/types/chat"
import {Prompt} from "@/types/prompt"

import {VariableModal} from "./VariableModal"

interface Props {
  conversation: Conversation
  prompts: Prompt[]
  onChangePrompt: (prompt: string) => void
}

export const SystemPrompt: FC<Props> = ({conversation, prompts, onChangePrompt}) => {
  const {t} = useTranslation("chat")

  const [value, setValue] = useState<string>("")
  const [activePromptIndex, setActivePromptIndex] = useState(0)
  const [promptInputValue, setPromptInputValue] = useState("")
  const [variables, setVariables] = useState<string[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const maxLength = conversation.model.maxLength

    if (value.length > maxLength) {
      alert(
        t(`Prompt limit is {{maxLength}} characters. You have entered {{valueLength}} characters.`, {
          maxLength,
          valueLength: value.length
        })
      )
      return
    }

    setValue(value)
    if (value.length > 0) {
      onChangePrompt(value)
    }
  }

  const parseVariables = (content: string) => {
    const regex = /{{(.*?)}}/g
    const foundVariables = []
    let match

    while ((match = regex.exec(content)) !== null) {
      foundVariables.push(match[1])
    }

    return foundVariables
  }

  const handlePromptSelect = (prompt: Prompt) => {
    const parsedVariables = parseVariables(prompt.content)
    setVariables(parsedVariables)

    if (parsedVariables.length > 0) {
      setIsModalVisible(true)
    } else {
      const updatedContent = value?.replace(/\/\w*$/, prompt.content)

      setValue(updatedContent)
      onChangePrompt(updatedContent)
    }
  }

  const handleSubmit = (updatedVariables: string[]) => {
    const newContent = value?.replace(/{{(.*?)}}/g, (match, variable) => {
      const index = variables.indexOf(variable)
      return updatedVariables[index]
    })

    setValue(newContent)
    onChangePrompt(newContent)

    if (textareaRef && textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  useEffect(() => {
    if (textareaRef && textareaRef.current) {
      textareaRef.current.style.height = "inherit"
      textareaRef.current.style.height = `${textareaRef.current?.scrollHeight}px`
    }
  }, [value])

  useEffect(() => {
    if (conversation.prompt) {
      setValue(conversation.prompt)
    } else {
      setValue(OPENAI_DEFAULT_SYSTEM_PROMPT)
    }
  }, [conversation])

  return (
    <div className="flex flex-col">
      <label className="mb-2 text-left text-neutral-700 dark:text-neutral-400">{t("System Prompt")}</label>
      <textarea
        ref={textareaRef}
        className="w-full rounded-lg border border-neutral-200 bg-transparent px-4 py-3 text-neutral-900 dark:border-neutral-600 dark:text-neutral-100"
        style={{
          resize: "none",
          bottom: `${textareaRef?.current?.scrollHeight}px`,
          maxHeight: "300px",
          overflow: `${textareaRef.current && textareaRef.current.scrollHeight > 400 ? "auto" : "hidden"}`
        }}
        placeholder={t(`Enter a prompt...`)}
        value={t(value) || ""}
        rows={1}
        onChange={handleChange}
      />

      {isModalVisible && (
        <VariableModal
          prompt={prompts[activePromptIndex]}
          variables={variables}
          onSubmit={handleSubmit}
          onClose={() => setIsModalVisible(false)}
        />
      )}
    </div>
  )
}
