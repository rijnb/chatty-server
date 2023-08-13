import {OpenAIModel} from "./openai"

export const titleNewConversation = 'asd'

export type Role = "system" | "assistant" | "user"

export interface Message {
  role: Role
  content: string
}

export const equals = (msg1: Message, msg2: Message) => {
  return msg1.role == msg2.role && msg1.content == msg2.content
}

export interface ChatBody {
  model: OpenAIModel
  messages: Message[]
  key: string
  prompt: string
  temperature: number
}

export interface Conversation {
  id: string
  name: string
  messages: Message[]
  model: OpenAIModel
  prompt: string
  temperature: number
  folderId: string | null
  time: number
}
