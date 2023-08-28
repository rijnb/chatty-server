import {OpenAIModelID} from "./openai"

export const titleNewConversation = "asd"

export type Role = "system" | "assistant" | "user"

export interface Message {
  role: Role
  content: string
}

export const equals = (msg1: Message, msg2: Message) => {
  return msg1.role == msg2.role && msg1.content == msg2.content
}

export interface ChatBody {
  apiKey: string
  messages: Message[]
  modelId: OpenAIModelID
  prompt: string
  temperature: number
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
