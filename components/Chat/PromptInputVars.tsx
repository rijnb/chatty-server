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
import { useAppInsightsContext } from "@microsoft/applicationinsights-react-js";
import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";



import { Button, Dialog, FormHeader, FormLabel, FormText, TextArea } from "@/components/Styled";
import { Prompt } from "@/types/prompt";
import { isLanguageSupported } from "@/utils/app/codeblock";


interface Props {
  prompt: Prompt
  promptVariables: string[]
  onSubmit: (updatedPromptVariables: string[]) => void
  onCancel: () => void
}

const PROMPT_KEYWORD_DROP = "#DROP"
const MAX_SIZE_FOR_SYNTAX_HIGHLIGHTING = 10000

const stripPromptKeywords = (promptVariable: string) => {
  return promptVariable.replace(PROMPT_KEYWORD_DROP, "").trim().replace(/[.]+$/g, "")
}

type DroppedFile = {
  name: string
  content: string
}

export const PromptInputVars = ({prompt, promptVariables, onSubmit, onCancel}: Props) => {
  const appInsights = useAppInsightsContext()

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
        .map((droppedFile) => {
          const ext = droppedFile.name.split(".").pop()?.toLowerCase() ?? ""
          return (
            `File: ${droppedFile.name}\n` +
            "```" +
            // Only add the extension if the file is small enough to be syntax highlighted.
            (droppedFile.content.length <= MAX_SIZE_FOR_SYNTAX_HIGHLIGHTING ? `${ext}` : "") +
            "\n" +
            `${droppedFile.content}` +
            "\n```\n"
          )
        })
        .join("\n")
    }
    return {numberOfFiles: numberOfFiles, content: content}
  }

  const handleSelectFiles = async (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const {numberOfFiles, content} = await readSelectedFiles(e)
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
      // noinspection ES6MissingAwait
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
    appInsights.trackEvent({name: "PromptUsed", properties: {prompt: prompt.id, isFactory: prompt.factory}})
    onSubmit(updatedPromptVariables.map((variable) => (variable.value === "" ? " " : variable.value)))
  }

  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus()
    }
  }, [])

  return (
    <Dialog onSubmit={handleSubmit} onClose={onCancel}>
      <FormHeader>{prompt.name}</FormHeader>
      <FormText className="mt-2">{prompt.description}</FormText>

      {updatedPromptVariables.map((variable, index) => (
        <div key={index}>
          {
            // If this is the last variable, and it ends with PROMPT_KEYWORD_DROP, then it is a file drop zone.
            index === updatedPromptVariables.length - 1 && variable.key.endsWith(PROMPT_KEYWORD_DROP) ? (
              <>
                <label
                  htmlFor="file-input"
                  className="mt-2 flex h-32 w-full cursor-pointer items-center justify-center rounded-lg border border-neutral-500 text-neutral-900 hover:bg-gray-300 dark:border-neutral-800 dark:border-opacity-50 dark:bg-[#40414F] dark:text-neutral-100 dark:hover:bg-gray-700"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDropFiles(index, e)}
                >
                  Drop files here (or click to select)
                  {numberOfSelectedFiles > 0 ? `: uploaded ${numberOfSelectedFiles} files` : ""}
                </label>
                <input
                  type="file"
                  id="file-input"
                  className="hidden"
                  multiple
                  onChange={(e) => handleSelectFiles(index, e)}
                />
              </>
            ) : (
              <>
                <FormLabel htmlFor={`input-${index}`} className="mt-2">
                  {stripPromptKeywords(variable.key)}:
                </FormLabel>
                <TextArea
                  id={`input-${index}`}
                  ref={index === 0 ? nameInputRef : undefined}
                  placeholder={`${variable.key}...`}
                  value={variable.value}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(index, e.target.value)}
                  rows={5}
                />
              </>
            )
          }
        </div>
      ))}

      <Button className="mt-2" onClick={handleSubmit}>
        Submit
      </Button>
    </Dialog>
  )
}

export default PromptInputVars
