import {Dispatch, createContext} from "react"
import {ActionType} from "@/hooks/useCreateReducer"
import {SupportedExportFormats} from "@/types/export"
import {Prompt} from "@/types/prompt"
import {PromptBarInitialState} from "./PromptBar.state"


export interface PromptBarContextProps {
  state: PromptBarInitialState
  dispatch: Dispatch<ActionType<PromptBarInitialState>>
  handleCreatePrompt: () => void
  handleDeletePrompt: (prompt: Prompt) => void
  handleUpdatePrompt: (prompt: Prompt) => void
  handleClearPrompts: () => void
  handleImportPrompts: (data: SupportedExportFormats) => void
  handleExportPrompts: () => void
}

const PromptBarContext = createContext<PromptBarContextProps>(undefined!)

export default PromptBarContext