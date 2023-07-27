import {IconFileExport, IconSettings} from "@tabler/icons-react"
import {useContext, useState} from "react"

import {useTranslation} from "next-i18next"

import HomeContext from "@/pages/api/home/home.context"

import ChatbarContext from "@/components/Chatbar/Chatbar.context"
import {ImportData} from "@/components/Settings/ImportData"
import {ApiKey} from "@/components/Settings/ApiKey"
import {SettingsDialog} from "@/components/Settings/SettingsDialog"
import {UnlockCode} from "@/components/Settings/UnlockCode"
import {SidebarButton} from "@/components/Sidebar/SidebarButton"

import {ClearConversations} from "./ClearConversations"
import {PluginKeys} from "./PluginKeys"

export const ChatbarSettings = () => {
  const {t} = useTranslation("sidebar")
  const [isSettingDialogOpen, setIsSettingDialog] = useState<boolean>(false)

  const {
    state: {
      apiKey,
      unlockCode,
      serverSideApiKeyIsSet,
      serverSideUnlockCodeIsSet,
      serverSidePluginKeysSet,
      conversations
    }
  } = useContext(HomeContext)

  const {
    handleClearConversations,
    handleImportConversations,
    handleExportConversations,
    handleApiKeyChange,
    handleUnlockCodeChange
  } = useContext(ChatbarContext)

  return (
    <div className="flex flex-col items-center space-y-1 border-t border-white/20 pt-1 text-sm">
      {conversations.length > 0 ? <ClearConversations onClearConversations={handleClearConversations} /> : null}

      <ImportData text={t("Import conversations")} onImport={handleImportConversations} />

      {conversations.length > 0 ? (
        <SidebarButton
          text={t("Export conversations")}
          icon={<IconFileExport size={18} />}
          onClick={() => handleExportConversations()}
        />
      ) : null}

      <SidebarButton text={t("Settings")} icon={<IconSettings size={18} />} onClick={() => setIsSettingDialog(true)} />

      {!serverSideApiKeyIsSet ? <ApiKey apiKey={apiKey} onApiKeyChange={handleApiKeyChange} /> : null}

      {!serverSidePluginKeysSet ? <PluginKeys /> : null}

      <SettingsDialog
        open={isSettingDialogOpen}
        onClose={() => {
          setIsSettingDialog(false)
        }}
      />

      {serverSideUnlockCodeIsSet ? (
        <UnlockCode unlockCode={unlockCode} onUnlockCodeChange={handleUnlockCodeChange} />
      ) : null}
    </div>
  )
}
