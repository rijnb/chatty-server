import {OpenAIModelID} from "@/types/openai"

/**
 * Do not change this file format, unless there is an upgrade path defined from earlier formats.
 */
export type SupportedFileFormats = FileFormatV5 | FileFormatV4

export interface FileFormatV5 {
  version: 5
  history: ConversationV5[]
  folders: FolderInterfaceV4[]
  prompts: PromptV5[]
}

export interface FileFormatV4 {
  version: 4
  history: ConversationV4[]
  folders: FolderInterfaceV4[]
  prompts: PromptV4[]
}

/**
 * These types are used to import conversations from earlier versions of the app.
 * They are not used in the app itself.
 */

/**
 * V5.
 */
export interface ConversationV5 {
  id: string
  name: string
  messages: MessageV4[]
  modelId: OpenAIModelID // Changed to model ID in V5.
  prompt: string
  temperature: number
  folderId: string | undefined
  time: number
}

export interface PromptV5 {
  id: string
  name: string
  description: string
  content: string
  modelId: OpenAIModelID // Changed to model ID in V5.
  folderId: string | undefined
  factory: boolean | undefined
}

/**
 * V4.
 */

export interface ConversationV4 {
  id: string
  name: string
  messages: MessageV4[]
  model: OpenAIModelV4
  prompt: string
  temperature: number
  folderId: string | undefined
  time: number
}

export interface MessageV4 {
  role: RoleV4
  content: string
}

export type RoleV4 = "system" | "assistant" | "user"

export interface OpenAIModelV4 {
  id: string
  name: string
  maxLength: number
  tokenLimit: number
}
export interface FolderInterfaceV4 {
  id: string
  name: string
  type: FolderTypeV4
  factory: boolean | undefined
}

export type FolderTypeV4 = "chat" | "prompt"

export interface PromptV4 {
  id: string
  name: string
  description: string
  content: string
  model: OpenAIModelV4
  folderId: string | undefined
  factory: boolean | undefined
}
