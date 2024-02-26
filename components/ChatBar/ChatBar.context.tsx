import {Dispatch, createContext} from "react"

import {ChatBarInitialState} from "@/components/ChatBar/ChatBar.state"
import {ActionType} from "@/hooks/useCreateReducer"

export interface ChatBarContextProps {
  state: ChatBarInitialState
  dispatch: Dispatch<ActionType<ChatBarInitialState>>
  handleToolConfigurationChange: (toolId: string, configuration: any) => void
  handleClearToolConfiguration: (toolId: string) => void
  handleApiKeyChange: (apiKey: string) => void
}

const ChatBarContext = createContext<ChatBarContextProps>(undefined!)

export default ChatBarContext
