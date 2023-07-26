import { OpenAIModel } from "./openai";


export interface Message {
  role: Role
  content: string
}

export const isSame = (msg1: Message, msg2: Message) => {
  return msg1.role == msg2.role && msg1.content == msg2.content
}

export type Role = "assistant" | "user"

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