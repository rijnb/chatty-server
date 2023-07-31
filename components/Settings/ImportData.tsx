import {IconFileImport} from "@tabler/icons-react"
import {FC, useState} from "react"
import {isValidJsonData} from "@/utils/app/import"
import {SupportedFileFormats} from "@/types/export"
import {SidebarButton} from "../Sidebar/SidebarButton"


interface Props {
  id: string
  text: string
  onImport: (data: SupportedFileFormats) => void
}

export const ImportData: FC<Props> = ({id, text, onImport}) => {
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
        onChange={(e) => {
          console.info(`Importing file ${e.target.files?.length} files`)
          if (!e.target.files?.length) {
            return
          }

          Array.from(e.target.files).forEach((file) => {
            const reader = new FileReader()
            reader.onload = (e) => {
              try {
                let json = JSON.parse(e.target?.result as string)
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
          e.target.value = ""
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
          {errors.map((error, index) => (
            <p key={index} className="error-message">
              {error}
            </p>
          ))}
        </div>
      )}
    </>
  )
}