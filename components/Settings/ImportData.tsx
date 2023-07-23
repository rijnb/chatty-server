import {IconFileImport} from "@tabler/icons-react"
import {FC, useState} from "react"

import {useTranslation} from "next-i18next"

import {isValidFile} from "@/utils/app/import"

import {SupportedExportFormats} from "@/types/export"

import {SidebarButton} from "../Sidebar/SidebarButton"


interface Props {
  text: string
  onImport: (data: SupportedExportFormats) => void
}

export const ImportData: FC<Props> = ({text, onImport}) => {
  const {t} = useTranslation("sidebar")
  const [errors, setErrors] = useState<string[]>([])
  return (
    <>
      <input
        id="import-file"
        className="sr-only"
        tabIndex={-1}
        type="file"
        accept=".json"
        multiple
        onChange={(e) => {
          if (!e.target.files?.length) {
            return
          }

          Array.from(e.target.files).forEach((file) => {
            const reader = new FileReader()
            reader.onload = (e) => {
              try {
                let json = JSON.parse(e.target?.result as string)
                const validationResult = isValidFile(json)
                if (validationResult.length === 0) {
                  onImport(json)
                  setErrors([])
                } else {
                  setErrors(validationResult)
                }
              } catch (error) {
                setErrors(["Invalid JSON file"])
              }
            }
            reader.readAsText(file)
          })
        }}
      />

      <SidebarButton
        text={text}
        icon={<IconFileImport size={18} />}
        onClick={() => {
          const importFile = document.querySelector(
            "#import-file"
          ) as HTMLInputElement
          if (importFile) {
            importFile.click()
          }
        }}
      />
      {errors.length > 0 && (
        <div className="error-messages">
          Errors in JSON file, not imported:
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