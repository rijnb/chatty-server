import {IconFileExport} from "@tabler/icons-react"
import {FC, useContext} from "react"

import {useTranslation} from "next-i18next"

import HomeContext from "@/pages/api/home/home.context"

import PromptbarContext from "@/components/Promptbar/PromptBar.context"
import {ImportData} from "@/components/Settings/ImportData"
import {SidebarButton} from "@/components/Sidebar/SidebarButton"

import {ClearPrompts} from "./ClearPrompts"


interface Props {}

export const PromptbarSettings: FC<Props> = () => {
  const {t} = useTranslation("sidebar")
  const {
    state: {prompts},
    dispatch: homeDispatch
  } = useContext(HomeContext)

  const {handleClearPrompts, handleImportPrompts, handleExportPrompts} =
    useContext(PromptbarContext)

  return (
    <div>
      {prompts.length > 0 ? (
        <ClearPrompts onClearPrompts={handleClearPrompts} />
      ) : (
        ""
      )}

      <ImportData text={t("Import prompts")} onImport={handleImportPrompts} />

      <SidebarButton
        text={t("Export prompts")}
        icon={<IconFileExport size={18} />}
        onClick={() => handleExportPrompts()}
      />
    </div>
  )
}