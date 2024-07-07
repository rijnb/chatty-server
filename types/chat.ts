/**
 * Note that the names of properties in this file are
 * dictated by the API interface of OpenAI.
 */
export type Role = "system" | "assistant" | "user"

export interface MessagePartText {
  type: "text"
  text: string
}

export interface ImageUrl {
  url: string // Name of property dictated by OpenAI API.
  detail?: "auto" | "low" | "high" // Values of property dictated by OpenAI API.
}

export interface MessagePartImage {
  type: "image_url" // Value of property dictated by OpenAI API.
  image_url: ImageUrl // Name of property dictated by OpenAI API.
}

export type MessagePart = MessagePartText | MessagePartImage

export interface UserMessage {
  role: "user"
  content: string | MessagePart[]
  name?: string
}

export interface SystemMessage {
  role: "system"
  content: string
  name?: string
}

export interface AssistantMessage {
  role: "assistant"
  content?: string | null
  name?: string
}

export interface ToolMessage {
  role: "tool"
  content: string
  tool_call_id: string
  name?: string
}

export type Message = UserMessage | SystemMessage | AssistantMessage | ToolMessage

// This type is used to send a request to the API.
export interface ChatBody {
  apiKey: string
  messages: Message[]
  modelId: string
  prompt: string
  temperature: number
  outputTokenLimit: number
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
    return message.content
  }
  const messageItems = message.content as MessagePart[]
  return messageItems
    .map((item) => {
      if (item.type === "text") {
        return item.text
      } else if (item.type === "image_url") {
        return item.image_url.url
      }
    })
    .join()
}

export const getMessageStringForDisplay = (message: Message): string => {
  if (typeof message.content === "string") {
    return String(message.content)
  }
  const messageItems = message.content as MessagePart[]
  return messageItems
    .filter((item) => item.type === "text")
    .map((item) => {
      return (item as MessagePartText).text
    })
    .join()
}

export const getMessageImageContent = (message: Message): string[] => {
  const images: string[] = []
  if (typeof message.content !== "string") {
    const messageItems = message.content as MessagePart[]
    messageItems
      .filter((item) => item.type === "image_url")
      .forEach((item) => {
        images.push((item as MessagePartImage).image_url.url)
      })
  }
  return images
}

export const createMessage = (role: string, content: any): Message => {
  if (role === "user") {
    return {role, content: [{type: "text", text: content}]}
  } else if (role === "system") {
    return {role, content}
  } else if (role === "assistant") {
    return {role, content}
  } else if (role === "tool") {
    return {role, content, tool_call_id: content}
  } else {
    throw new Error(`Invalid role ${role}`)
  }
}
