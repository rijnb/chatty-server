import {Dispatch, createContext} from "react"

import {ActionType} from "@/hooks/useCreateReducer"

import {SupportedExportFormats} from "@/types/export"
import {Prompt} from "@/types/prompt"

import {PromptbarInitialState} from "./Promptbar.state"


export interface PromptbarContextProps {
  state: PromptbarInitialState
  dispatch: Dispatch<ActionType<PromptbarInitialState>>
  handleCreatePrompt: () => void
  handleDeletePrompt: (prompt: Prompt) => void
  handleUpdatePrompt: (prompt: Prompt) => void
  handleClearPrompts: () => void
  handleImportPrompts: (data: SupportedExportFormats) => void
  handleExportPrompts: () => void
}

const PromptbarContext = createContext<PromptbarContextProps>(undefined!)

export default PromptbarContext