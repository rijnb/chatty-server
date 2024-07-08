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
import React, {useContext} from "react"

import ChatBarContext from "@/components/ChatBar/ChatBar.context"
import ClearConversations from "@/components/ChatBar/components/ClearConversations"
import PluginKeyList from "@/components/ChatBar/components/PluginKeyList"
import ApiKey from "@/components/Settings/ApiKey"
import ImportData from "@/components/Settings/ImportData"
import SidebarButton from "@/components/Sidebar/SidebarButton"
import {UnlockCodeEditor, useUnlock} from "@/components/UnlockCode"
import HomeContext from "@/pages/api/home/home.context"

export const ChatBarSettings = () => {
  const {t} = useTranslation("common")

  const {isProtected, code, setCode} = useUnlock()

  const {
    state: {apiKey, serverSideApiKeyIsSet, serverSidePluginKeysSet, conversations}
  } = useContext(HomeContext)

  const {handleClearConversations, handleImportConversations, handleExportConversations, handleApiKeyChange} =
    useContext(ChatBarContext)

  return (
    <div className="flex flex-col items-center space-y-1 border-t border-white/20 pt-1 text-sm">
      {conversations.length > 0 ? <ClearConversations onClearConversations={handleClearConversations} /> : null}

      <ImportData id="conversations" text={t("Import conversations")} onImport={handleImportConversations} />
      {conversations.length > 0 ? (
        <SidebarButton
          text={t("Export conversations")}
          icon={<IconFileExport size={18} />}
          onClick={() => handleExportConversations()}
        />
      ) : null}
      {!serverSideApiKeyIsSet ? <ApiKey apiKey={apiKey} onApiKeyChange={handleApiKeyChange} /> : null}
      {!serverSidePluginKeysSet ? <PluginKeyList /> : null}
      {isProtected ? <UnlockCodeEditor unlockCode={code} onUnlockCodeChange={setCode} /> : null}
    </div>
  )
}

export default ChatBarSettings
