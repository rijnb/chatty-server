import {Dispatch, createContext} from "react"
import {ActionType} from "@/hooks/useCreateReducer"
import {SupportedFileFormats} from "@/types/import"
import {Prompt} from "@/types/prompt"
import {PromptBarInitialState} from "./PromptBar.state"


export interface PromptBarContextProps {
  state: PromptBarInitialState
  dispatch: Dispatch<ActionType<PromptBarInitialState>>
  handleCreatePrompt: () => void
  handleDeletePrompt: (prompt: Prompt) => void
  handleUpdatePrompt: (prompt: Prompt) => void
  handleClearPrompts: () => void
  handleImportPrompts: (data: SupportedFileFormats) => void
  handleExportPrompts: () => void
}

const PromptBarContext = createContext<PromptBarContextProps>(undefined!)

export default PromptBarContext