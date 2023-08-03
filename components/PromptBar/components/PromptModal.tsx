import {FC, KeyboardEvent, useEffect, useMemo, useRef, useState} from "react"
import {useTranslation} from "next-i18next"
import {isKeyboardEnter} from "@/utils/app/keyboard"
import {Prompt} from "@/types/prompt"


interface Props {
  prompt: Prompt
  onClose: () => void
  onUpdatePrompt: (prompt: Prompt) => void
}

export const PromptModal: FC<Props> = ({prompt, onClose, onUpdatePrompt}) => {
  const {t} = useTranslation("promptbar")
  const [name, setName] = useState(prompt.name)
  const [description, setDescription] = useState(prompt.description)
  const [content, setContent] = useState(prompt.content)
  const [factory, setFactory] = useState(prompt.factory)

  const modalRef = useRef<HTMLDivElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  const updatedPrompt = useMemo(
    () => ({...prompt, name, description, content, factory}),
    [prompt, name, description, content, factory]
  )

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isKeyboardEnter(e) && !e.shiftKey) {
      e.preventDefault()
      onUpdatePrompt(updatedPrompt)
      onClose()
    } else if (e.key === "Escape") {
      onClose()
    }
  }

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        window.addEventListener("mouseup", handleMouseUp)
      }
    }
    const handleMouseUp = (e: MouseEvent) => {
      window.removeEventListener("mouseup", handleMouseUp)
      onUpdatePrompt(updatedPrompt)
      onClose()
    }
    window.addEventListener("mousedown", handleMouseDown)
    return () => {
      window.removeEventListener("mousedown", handleMouseDown)
    }
  }, [onClose, onUpdatePrompt, updatedPrompt])

  useEffect(() => {
    nameInputRef.current?.focus()
  }, [])

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onKeyDown={handleKeyDown}
    >
      <div className="fixed inset-0 z-10 overflow-hidden">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true" />

          <div
            ref={modalRef}
            className="dark:border-netural-400 inline-block max-h-[400px] transform overflow-y-auto rounded-lg border border-gray-300 bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all dark:bg-[#202123] sm:my-8 sm:max-h-[600px] sm:w-full sm:max-w-lg sm:p-6 sm:align-middle"
            role="dialog"
          >
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
              className="w-full px-4 py-2 mt-2 border rounded-lg shadow border-neutral-500 text-neutral-900 hover:bg-neutral-100 focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-300"
              onClick={() => {
                onUpdatePrompt(updatedPrompt)
                onClose()
              }}
            >
              {t("Save")}
            </button>

            {prompt.factory && (
              <div className="mt-2 text-sm font-bold text-red-900 dark:text-red-300">
                {t("Note: This is factory prompt. If you edit and saveit, a user prompt will be created. The factory prompt will not be changed.")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}