import {OpenAIModelID} from "./openai"

export type Role = "system" | "assistant" | "user"

export interface Message {
  role: Role
  content: string
}

export interface ChatBody {
  apiKey: string
  messages: Message[]
  modelId: OpenAIModelID
  prompt: string
  temperature: number
  maxTokens: number
}

export interface Conversation {
  id: string
  name: string
  messages: Message[]
  modelId: OpenAIModelID
  prompt: string
  temperature: number
  maxTokens: number
  folderId: string | undefined
  time: number
}
