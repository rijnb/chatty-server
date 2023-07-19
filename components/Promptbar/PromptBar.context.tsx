import {ActionType} from "@/hooks/useCreateReducer";

import {Prompt} from "@/types/prompt";
import {createContext, Dispatch} from "react";

import {PromptbarInitialState} from "./Promptbar.state";

export interface PromptbarContextProps {
  state: PromptbarInitialState;
  dispatch: Dispatch<ActionType<PromptbarInitialState>>;
  handleCreatePrompt: () => void;
  handleDeletePrompt: (prompt: Prompt) => void;
  handleUpdatePrompt: (prompt: Prompt) => void;
}

const PromptbarContext = createContext<PromptbarContextProps>(undefined!);

export default PromptbarContext;
