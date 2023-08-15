import {ChangeEvent, DragEvent, KeyboardEvent, useEffect, useRef, useState} from "react"
import {isKeyboardEnter} from "@/utils/app/keyboard"
import {Prompt} from "@/types/prompt"
import {ModalDialog} from "@/components/ModalDialog"


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
  const [updatedPromptVariables, setUpdatedPromptVariables] = useState<{key: string; value: string}[]>(
    promptVariables
      .map((promptVariable) => ({key: promptVariable, value: ""}))
      .filter((item, index, array) => array.findIndex((t) => t.key === item.key) === index)
  )
  const [filesDropped, setFilesDropped] = useState<number>(0)

  const nameInputRef = useRef<HTMLTextAreaElement>(null)

  const readDroppedFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    let value = ""
    const files = e.target.files

    if (files) {
      const readFilePromises = Array.from(files)
        .filter((file) => file.type === "text/plain")
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

      const droppedFiles = await Promise.all(readFilePromises)
      value = droppedFiles
        .map((droppedFile) => `File: ${droppedFile.name}\n` + "```\n" + droppedFile.content + "\n```\n")
        .join("\n")
    }
    return value
  }

  const handleDrop = async (index: number, e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files) {
      const fileInput = document.getElementById("file-input") as HTMLInputElement
      fileInput.files = e.dataTransfer.files
      const value = (await readDroppedFiles({target: fileInput} as ChangeEvent<HTMLInputElement>)).trim()
      if (value != "") {
        setFilesDropped(filesDropped + 1)
      }
      const oldValue = updatedPromptVariables.at(index)?.value ?? ""
      handleChange(index, `${oldValue}${oldValue !== "" ? "\n\n" : ""}${value}`)
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
      <input type="file" id="file-input" className="hidden" multiple onChange={readDroppedFiles} />

      <ModalDialog
        className="dark:border-netural-400 inline-block max-h-[400px] transform overflow-y-auto rounded-lg border border-gray-300 bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all dark:bg-[#202123] sm:my-8 sm:max-h-[600px] sm:w-full sm:max-w-lg sm:p-6 sm:align-middle"
        onClose={onCancel}
      >
        <div className="mb-4 text-xl font-bold text-black dark:text-neutral-200">{prompt.name}</div>
        <div className="mb-4 text-sm text-black dark:text-neutral-200">{prompt.description}</div>

        {updatedPromptVariables.map((variable, index) => (
          <div className="mb-4" key={index}>
            <div className="mb-2 text-sm font-bold text-neutral-200">{stripPromptKeywords(variable.key)}:</div>
            <div role="dialog" onKeyDown={handleKeyDown}>
              {
                // If this is the last variable and it ends with PROMPT_KEYWORD_DROP, then it is a file drop zone.
                index === updatedPromptVariables.length - 1 && variable.key.endsWith(PROMPT_KEYWORD_DROP) ? (
                  <label
                    htmlFor="file-input"
                    className="drop-zone flex h-32 w-full cursor-pointer items-center justify-center rounded-lg border-2 text-center text-neutral-600"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(index, e)}
                  >
                    Drop your files here (or click to select){" "}
                    {filesDropped > 0 ? `: dropped ${filesDropped} files` : ""}
                  </label>
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