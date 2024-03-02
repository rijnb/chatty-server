import {IconFileExport} from "@tabler/icons-react"
import {useTranslation} from "next-i18next"

import ClearPrompts from "./ClearPrompts"
import usePromptsOperations from "@/components/PromptBar/usePromptsOperations"
import ImportData from "@/components/Settings/ImportData"
import SidebarButton from "@/components/Sidebar/SidebarButton"

interface Props {}

export const PromptBarSettings = ({}: Props) => {
  const {t} = useTranslation("common")
  const {prompts, clearPrompts, importPrompts, exportPrompts} = usePromptsOperations()

  return (
    <div>
      <ImportData id="prompts" text={t("Import user prompts")} onImport={importPrompts} />

      {prompts.length > 0 ? (
        <SidebarButton
          text={t("Export user prompts")}
          icon={<IconFileExport size={18} />}
          onClick={() => exportPrompts()}
        />
      ) : null}

      {prompts.length > 0 ? <ClearPrompts onClearPrompts={clearPrompts} /> : null}
    </div>
  )
}
export default PromptBarSettings
