import {FC, KeyboardEvent, useEffect, useMemo, useRef, useState} from "react"
import {useTranslation} from "next-i18next"
import {isKeyboardEnter} from "@/utils/app/keyboard"
import {Prompt} from "@/types/prompt"
import {ModalDialog} from "@/components/ModalDialog"

interface Props {
  prompt: Prompt
  onClose: () => void
  onUpdatePrompt: (prompt: Prompt) => void
}

export const PromptEditModal: FC<Props> = ({prompt, onClose, onUpdatePrompt}) => {
  const {t} = useTranslation("promptbar")
  const [name, setName] = useState(prompt.name)
  const [description, setDescription] = useState(prompt.description)
  const [content, setContent] = useState(prompt.content)
  const [factory] = useState(prompt.factory)

  const nameInputRef = useRef<HTMLInputElement>(null)

  const updatedPrompt = useMemo(
    () => ({...prompt, name, description, content, factory}),
    [prompt, name, description, content, factory]
  )

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isKeyboardEnter(e) && !e.shiftKey) {
      e.preventDefault()
      onUpdatePrompt(updatedPrompt)
    }
  }

  useEffect(() => {
    nameInputRef.current?.focus()
  }, [])

  return (
    <ModalDialog
      className="dark:border-netural-400 inline-block max-h-[400px] transform overflow-y-auto rounded-lg border border-gray-300 bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all dark:bg-[#202123] sm:my-8 sm:max-h-[600px] sm:w-full sm:max-w-lg sm:p-6 sm:align-middle"
      onClose={onClose}
      onClickAway={() => onUpdatePrompt(updatedPrompt)}
    >
      <div role="dialog" onKeyDown={handleKeyDown}>
        <div className="text-sm font-bold text-black dark:text-neutral-200">{t("Name")}</div>
        <input
          ref={nameInputRef}
          className="mt-2 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-[#40414F] dark:text-neutral-100"
          placeholder={t("A name for your prompt.")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={(e) => setName(e.target.value)}
        />

        <div className="mt-2 text-sm font-bold text-black dark:text-neutral-200">{t("Description")}</div>
        <textarea
          className="mt-2 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-[#40414F] dark:text-neutral-100"
          style={{resize: "none"}}
          placeholder={t("A description for your prompt.")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={(e) => setDescription(e.target.value)}
          rows={3}
        />

        <div className="mt-2 text-sm font-bold text-black dark:text-neutral-200">{t("Prompt")}</div>
        <textarea
          className="mt-2 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-[#40414F] dark:text-neutral-100"
          style={{resize: "none"}}
          placeholder={t(
            "Prompt content. Use {{}} to denote variables. For example: {{Translate this text}} {{Into this language}}"
          )}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={(e) => setContent(e.target.value)}
          rows={9}
        />

        <button
          type="button"
          className="mt-2 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow hover:bg-neutral-100 focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-300"
          onClick={() => {
            onUpdatePrompt(updatedPrompt)
          }}
        >
          {t("Save")}
        </button>

        {prompt.factory && (
          <div className="mt-2 text-sm text-red-900 dark:text-red-300">
            {t(
              "This is factory prompt. If you edit and save it, a new user prompt will be created. The factory prompt cannot be edited or deleted."
            )}
          </div>
        )}
      </div>
    </ModalDialog>
  )
}

export default PromptEditModal
