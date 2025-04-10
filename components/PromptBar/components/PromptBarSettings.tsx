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
import {IconFileExport} from "@tabler/icons-react"
import {useTranslation} from "next-i18next"
import {useContext} from "react"

import ClearPrompts from "./ClearPrompts"
import PromptBarContext from "@/components/PromptBar/PromptBar.context"
import ImportData from "@/components/Settings/ImportData"
import SidebarButton from "@/components/Sidebar/SidebarButton"
import HomeContext from "@/pages/api/home/home.context"

interface Props {}

export const PromptBarSettings = ({}: Props) => {
  const {t} = useTranslation("common")
  const {
    state: {prompts}
  } = useContext(HomeContext)

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
