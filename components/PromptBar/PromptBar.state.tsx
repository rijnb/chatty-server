import {Prompt} from "@/types/prompt"

export interface PromptBarInitialState {
  searchTerm: string
  filteredPrompts: Prompt[]
}

export const initialState: PromptBarInitialState = {
  searchTerm: "",
  filteredPrompts: []
}
