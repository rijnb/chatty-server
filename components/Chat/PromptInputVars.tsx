import {useTheme} from "next-themes"
import {ChangeEvent, DragEvent, KeyboardEvent, useEffect, useRef, useState} from "react"

import {ModalDialog} from "@/components/ModalDialog"
import {Prompt} from "@/types/prompt"
import {isLanguageSupported} from "@/utils/app/codeblock"
import {isKeyboardEnter} from "@/utils/app/keyboard"

interface Props {
  prompt: Prompt
  promptVariables: string[]
  onSubmit: (updatedPromptVariables: string[]) => void
  onCancel: () => void
}

const PROMPT_KEYWORD_DROP = "#DROP"

const stripPromptKeywords = (promptVariable: string) => {
  return promptVariable.replace(PROMPT_KEYWORD_DROP, "").trim()
}

type DroppedFile = {
  name: string
  content: string
}

export const PromptInputVars = ({prompt, promptVariables, onSubmit, onCancel}: Props) => {
  const {theme} = useTheme()
  const [updatedPromptVariables, setUpdatedPromptVariables] = useState<{key: string; value: string}[]>(
    promptVariables
      .map((promptVariable) => ({key: promptVariable, value: ""}))
      .filter((item, index, array) => array.findIndex((t) => t.key === item.key) === index)
  )
  const [numberOfSelectedFiles, setNumberOfSelectedFiles] = useState<number>(0)

  const nameInputRef = useRef<HTMLTextAreaElement>(null)

  const readSelectedFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    let content = ""
    let numberOfFiles = 0
    const files = e.target.files
    if (files) {
      const readFilePromises = Array.from(files)
        .filter((file) => file.type === "text/plain" || isLanguageSupported(file.name))
        .map((file) => {
          return new Promise<DroppedFile>((resolve) => {
            const reader = new FileReader()
            reader.onload = (e) => {
              const fileContent = e.target?.result
              resolve({name: file.name, content: fileContent as string})
            }
            reader.readAsText(file)
          })
        })

      const readFiles = await Promise.all(readFilePromises)
      numberOfFiles = readFiles.length
      content = readFiles
        .map((droppedFile) => `File: ${droppedFile.name}\n` + "```\n" + droppedFile.content + "\n```\n")
        .join("\n")
    }
    return {numberOfFiles: numberOfFiles, content: content}
  }

  const handleSelectFiles = async (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const {numberOfFiles, content} = await readSelectedFiles(e)
    console.debug("numberOfFiles", numberOfFiles, "content", content) //!!
    if (numberOfFiles > 0 && content.length > 0) {
      setNumberOfSelectedFiles(numberOfSelectedFiles + numberOfFiles)
    }
    const oldValue = updatedPromptVariables.at(index)?.value ?? ""
    handleChange(index, `${oldValue}${oldValue !== "" ? "\n\n" : ""}${content}`)
  }

  const handleDropFiles = async (index: number, e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files) {
      const fileInput = document.getElementById("file-input") as HTMLInputElement
      fileInput.files = e.dataTransfer.files
      handleSelectFiles(index, {target: fileInput} as ChangeEvent<HTMLInputElement>)
    }
  }

  const handleChange = (index: number, value: string) => {
    setUpdatedPromptVariables((prev) => {
      const updated = [...prev]
      updated[index].value = value
      return updated
    })
  }

  const handleSubmit = () => {
    onSubmit(updatedPromptVariables.map((variable) => (variable.value === "" ? " " : variable.value)))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isKeyboardEnter(e) && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus()
    }
  }, [])

  return (
    <>
      <ModalDialog
        className="dark:border-netural-400 inline-block max-h-[400px] transform overflow-y-auto rounded-lg border border-gray-300 bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all dark:bg-[#202123] sm:my-8 sm:max-h-[600px] sm:w-full sm:max-w-lg sm:p-6 sm:align-middle"
        onSubmit={handleSubmit}
        onClose={onCancel}
      >
        <div className="mb-4 text-xl font-bold text-black dark:text-neutral-200">{prompt.name}</div>
        <div className="mb-4 text-sm text-black dark:text-neutral-200">{prompt.description}</div>

        {updatedPromptVariables.map((variable, index) => (
          <div className="mb-4" key={index}>
            <div className={`mb-2 text-sm font-bold ${theme === "dark" ? "text-neutral-200" : "text-neutral-800"}`}>
              {stripPromptKeywords(variable.key)}:
            </div>
            <div role="dialog" onKeyDown={handleKeyDown}>
              {
                // If this is the last variable, and it ends with PROMPT_KEYWORD_DROP, then it is a file drop zone.
                index === updatedPromptVariables.length - 1 && variable.key.endsWith(PROMPT_KEYWORD_DROP) ? (
                  <div>
                    <input
                      type="file"
                      id="file-input"
                      className="hidden"
                      multiple
                      onChange={(e) => handleSelectFiles(index, e)}
                    />
                    <label
                      htmlFor="file-input"
                      className="drop-zone flex h-32 w-full cursor-pointer items-center justify-center rounded-lg border-2 text-center text-neutral-600"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDropFiles(index, e)}
                    >
                      Drop files here (or click to select)
                      {numberOfSelectedFiles > 0 ? `: uploaded ${numberOfSelectedFiles} files` : ""}
                    </label>
                  </div>
                ) : (
                  // Otherwise, it is a text input field.
                  <textarea
                    ref={index === 0 ? nameInputRef : undefined}
                    className="mt-1 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-[#40414F] dark:text-neutral-100"
                    style={{resize: "none"}}
                    placeholder={`${variable.key}...`}
                    value={variable.value}
                    onChange={(e) => handleChange(index, e.target.value)}
                    rows={5}
                  />
                )
              }
            </div>
          </div>
        ))}
        <button
          className="mt-6 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow hover:bg-neutral-100 focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-300"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </ModalDialog>
    </>
  )
}

export default PromptInputVars
