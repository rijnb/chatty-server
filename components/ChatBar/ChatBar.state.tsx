import {Conversation} from "@/types/chat"

export interface ChatBarInitialState {
  searchTerm: string
  filteredConversations: Conversation[]
}

export const initialState: ChatBarInitialState = {
  searchTerm: "",
  filteredConversations: []
}
