export type Role = "system" | "assistant" | "user"

export interface MessageItem {
  type: "text" | "image_url"
  text?: string
  image_url?: string
}

export interface Message {
  role: Role
  content: MessageItem[] | string
}

// This type is used to send a request to the API.
export interface ChatBody {
  apiKey: string
  messages: Message[]
  modelId: string
  prompt: string
  temperature: number
  maxTokens: number
}

// This type is used to store a conversation in the store.
export interface Conversation {
  id: string
  name: string
  messages: Message[]
  tokenCount: number
  modelId: string
  prompt: string
  temperature: number
  maxTokens: number
  folderId: string | undefined
  time: number
}

export const getMessageString = (message: Message): string => {
  if (typeof message.content === "string") {
    return String(message.content)
  }
  const messageItems = message.content as MessageItem[]
  return messageItems.map((item) => {
    if (item.type === "text") {
      return item.text
    }
    return item.image_url
  }).join("")
}
