import {Dispatch, createContext} from "react"
import {ActionType} from "@/hooks/useCreateReducer"
import {Conversation} from "@/types/chat"
import {SupportedExportFormats} from "@/types/export"
import {PluginKey} from "@/types/plugin"
import {ChatBarInitialState} from "@/components/ChatBar/ChatBar.state"


export interface ChatBarContextProps {
  state: ChatBarInitialState
  dispatch: Dispatch<ActionType<ChatBarInitialState>>
  handleDeleteConversation: (conversation: Conversation) => void
  handleClearConversations: () => void
  handleImportConversations: (data: SupportedExportFormats) => void
  handleExportConversations: () => void
  handlePluginKeyChange: (pluginKey: PluginKey) => void
  handleClearPluginKey: (pluginKey: PluginKey) => void
  handleApiKeyChange: (apiKey: string) => void
  handleUnlockCodeChange: (unlockCode: string) => void
}

const ChatBarContext = createContext<ChatBarContextProps>(undefined!)

export default ChatBarContext