import {IconFileExport} from "@tabler/icons-react"
import {FC, useContext} from "react"
import {useTranslation} from "next-i18next"
import HomeContext from "@/pages/api/home/home.context"
import PromptBarContext from "@/components/PromptBar/PromptBar.context"
import {ImportData} from "@/components/Settings/ImportData"
import {SidebarButton} from "@/components/Sidebar/SidebarButton"
import {ClearPrompts} from "./ClearPrompts"


interface Props {}

export const PromptBarSettings: FC<Props> = () => {
  const {t} = useTranslation("sidebar")
  const {
    state: {prompts}
  } = useContext(HomeContext)

  const {handleClearPrompts, handleImportPrompts, handleExportPrompts} = useContext(PromptBarContext)

  return (
    <div>
      {prompts.length > 0 ? <ClearPrompts onClearPrompts={handleClearPrompts} /> : null}

      <ImportData text={t("Import prompts")} onImport={handleImportPrompts} />

      {prompts.length > 0 ? (
        <SidebarButton
          text={t("Export prompts")}
          icon={<IconFileExport size={18} />}
          onClick={() => handleExportPrompts()}
        />
      ) : null}
    </div>
  )
}