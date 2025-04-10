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
import {IconFileImport} from "@tabler/icons-react"
import {useState} from "react"

import SidebarButton from "../Sidebar/SidebarButton"
import {SupportedFileFormats} from "@/types/import"
import {isValidJsonData} from "@/utils/app/import"

interface Props {
  id: string
  text: string
  onImport: (data: SupportedFileFormats) => void
}

export const ImportData = ({id, text, onImport}: Props) => {
  const [errors, setErrors] = useState<string[]>([])
  return (
    <>
      <input
        id={`import-${id}`}
        className="sr-only"
        tabIndex={-1}
        type="file"
        accept=".json"
        multiple
        onChange={(event) => {
          console.debug(`Importing file ${event.target.files?.length} files`)
          if (!event.target.files?.length) {
            return
          }

          Array.from(event.target.files).forEach((file) => {
            const reader = new FileReader()
            reader.onload = (progressEvent) => {
              try {
                let json = JSON.parse(progressEvent.target?.result as string)
                const validationErrors = isValidJsonData(json)
                if (validationErrors.length === 0) {
                  onImport(json)
                  setErrors([])
                } else {
                  setErrors(validationErrors)
                }
              } catch (error) {
                setErrors([`Invalid JSON file; file:${file.name}, exception:${error}`])
              }
            }
            reader.readAsText(file)
          })

          // Change the value of the input to make sure onChange fires next time.
          event.target.value = ""
        }}
      />

      <SidebarButton
        text={text}
        icon={<IconFileImport size={18} />}
        onClick={() => {
          const importFile = document.querySelector(`#import-${id}`) as HTMLInputElement
          if (importFile) {
            importFile.click()
          }
        }}
      />
      {errors.length > 0 && (
        <div className="error-messages">
          <p className="error-message">Warning: {errors.length} errors found</p>
        </div>
      )}
      {errors.map((error) => console.warn(`Error: ${error}`))}
    </>
  )
}

export default ImportData
