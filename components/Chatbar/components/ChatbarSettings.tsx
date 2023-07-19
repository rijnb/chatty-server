import { IconMarkdown, IconFileExport, IconSettings } from '@tabler/icons-react';
import { useContext, useState } from 'react';

import { useTranslation } from 'next-i18next';

import HomeContext from '@/pages/api/home/home.context';

import { SettingDialog } from '@/components/Settings/SettingDialog';

import { GuestCode } from '@/components/Settings/GuestCode';
import { Import } from '@/components/Settings/Import';
import { Key } from '@/components/Settings/Key';
import { SidebarButton } from '@/components/Sidebar/SidebarButton';
import ChatbarContext from '@/components/Chatbar/Chatbar.context';
import { ClearConversations } from './ClearConversations';
import { PluginKeys } from './PluginKeys';

export const ChatbarSettings = () => {
  const { t } = useTranslation('sidebar');
  const [isSettingDialogOpen, setIsSettingDialog] = useState<boolean>(false);

  const {
    state: {
      apiKey,
      guestCode,
      lightMode,
      serverSideApiKeyIsSet,
      serverSideGuestCodeIsSet,
      serverSidePluginKeysSet,
      conversations,
    },
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  const {
    handleClearConversations,
    handleImportConversations,
    handleExportData,
    handleExportMarkdown,
    handleApiKeyChange,
    handleGuestCodeChange,
  } = useContext(ChatbarContext);

  return (
    <div className="flex flex-col items-center space-y-1 border-t border-white/20 pt-1 text-sm">
      {conversations.length > 0 ? (
          <ClearConversations onClearConversations={handleClearConversations} />
      ) : null}

      <SidebarButton
        text={t('Export Markdown')}
        icon={<IconMarkdown size={18} />}
        onClick={handleExportMarkdown}
      />

      <Import onImport={handleImportConversations} />

      <SidebarButton
        text={t('Export config')}
        icon={<IconFileExport size={18} />}
        onClick={() => handleExportData()}
      />

      <SidebarButton
        text={t('Settings')}
        icon={<IconSettings size={18} />}
        onClick={() => setIsSettingDialog(true)}
      />

      {!serverSideApiKeyIsSet ? (
        <Key apiKey={apiKey} onApiKeyChange={handleApiKeyChange} />
      ) : null}

      {!serverSidePluginKeysSet ? <PluginKeys /> : null}

      <SettingDialog
        open={isSettingDialogOpen}
        onClose={() => {
          setIsSettingDialog(false);
        }}
      />

      {serverSideGuestCodeIsSet ? (
        <GuestCode
          guestCode={guestCode}
          onGuestCodeChange={handleGuestCodeChange}
        />
      ) : null}
    </div>
  );
};
