import {ChangeEvent, KeyboardEvent, useEffect, useRef, useState} from "react"
import {isKeyboardEnter} from "@/utils/app/keyboard"
import {Prompt} from "@/types/prompt"
import {ModalDialog} from "@/components/ModalDialog"


interface Props {
  prompt: Prompt
  promptVariables: string[]
  onSubmit: (updatedPromptVariables: string[]) => void
  onCancel: () => void
}

export const PromptInputVars = ({prompt, promptVariables, onSubmit, onCancel}: Props) => {
  const [updatedPromptVariables, setUpdatedPromptVariables] = useState<{key: string; value: string}[]>(
    promptVariables
      .map((promptVariable) => ({key: promptVariable, value: ""}))
      .filter((item, index, array) => array.findIndex((t) => t.key === item.key) === index)
  )

  const nameInputRef = useRef<HTMLTextAreaElement>(null)

  const handleFileDrop = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      // @ts-ignore
      ;[...files].forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const fileContent = e.target?.result
          console.log(`fileContent="${fileContent}"`)
          // Process the fileContent as needed.
        }
        reader.readAsText(file)
      })
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
      <input type="file" id="file-input" className="hidden" multiple onChange={handleFileDrop} />

      <ModalDialog
        className="dark:border-netural-400 inline-block max-h-[400px] transform overflow-y-auto rounded-lg border border-gray-300 bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all dark:bg-[#202123] sm:my-8 sm:max-h-[600px] sm:w-full sm:max-w-lg sm:p-6 sm:align-middle"
        onClose={onCancel}
      >
        <div className="mb-4 text-xl font-bold text-black dark:text-neutral-200">{prompt.name}</div>
        <div className="mb-4 text-sm text-black dark:text-neutral-200">{prompt.description}</div>

        {updatedPromptVariables.map((variable, index) => (
          <div className="mb-4" key={index}>
            <div className="mb-2 text-sm font-bold text-neutral-200">{variable.key}:</div>

            {(index === updatedPromptVariables.length - 1) && (variable.key.endsWith("@DROP")) ? (
              <div role="dialog" onKeyDown={handleKeyDown}>
                <label
                  htmlFor="file-input"
                  className="drop-zone flex h-10 w-full cursor-pointer items-center justify-center rounded-lg border-2 text-center text-neutral-600"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    if (e.dataTransfer.files) {
                      const fileInput = document.getElementById("file-input") as HTMLInputElement
                      fileInput.files = e.dataTransfer.files
                      handleFileDrop({target: fileInput} as ChangeEvent<HTMLInputElement>)
                    }
                  }}
                >
                  Drop your files here (or click to select files)
                </label>{" "}
                <button
                  className="mt-6 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow hover:bg-neutral-100 focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-300"
                  onClick={handleSubmit}
                >
                  Submit
                </button>
              </div>
            ) : (
              <textarea
                ref={index === 0 ? nameInputRef : undefined}
                className="mt-1 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-[#40414F] dark:text-neutral-100"
                style={{resize: "none"}}
                placeholder={`${variable.key}...`}
                value={variable.value}
                onChange={(e) => handleChange(index, e.target.value)}
                rows={5}
              />
            )}
          </div>
        ))}
      </ModalDialog>
    </>
  )
}

export default PromptInputVars