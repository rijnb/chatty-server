import {IconFileExport} from "@tabler/icons-react"
import {useTranslation} from "next-i18next"
import {useContext} from "react"

import ClearPrompts from "./ClearPrompts"
import PromptBarContext from "@/components/PromptBar/PromptBar.context"
import ImportData from "@/components/Settings/ImportData"
import SidebarButton from "@/components/Sidebar/SidebarButton"
import {useHomeContext} from "@/pages/api/home/home.context"

interface Props {}

export const PromptBarSettings = ({}: Props) => {
  const {t} = useTranslation("common")
  const {
    state: {prompts}
  } = useHomeContext()

  const {handleClearPrompts, handleImportPrompts, handleExportPrompts} = useContext(PromptBarContext)

  return (
    <div>
      <ImportData id="prompts" text={t("Import user prompts")} onImport={handleImportPrompts} />

      {prompts.length > 0 ? (
        <SidebarButton
          text={t("Export user prompts")}
          icon={<IconFileExport size={18} />}
          onClick={() => handleExportPrompts()}
        />
      ) : null}

      {prompts.length > 0 ? <ClearPrompts onClearPrompts={handleClearPrompts} /> : null}
    </div>
  )
}
export default PromptBarSettings
