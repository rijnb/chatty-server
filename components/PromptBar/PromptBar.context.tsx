import {Dispatch, createContext} from "react"

import {PromptBarInitialState} from "./PromptBar.state"
import {ActionType} from "@/hooks/useCreateReducer"

export interface PromptBarContextProps {
  state: PromptBarInitialState
  dispatch: Dispatch<ActionType<PromptBarInitialState>>
}

const PromptBarContext = createContext<PromptBarContextProps>(undefined!)

export default PromptBarContext
