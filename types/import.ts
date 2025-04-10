/*
 * Copyright (C) 2024, Rijn Buve.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions
 * of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * Do not change this file format, unless there is an upgrade path defined from earlier formats.
 */
export type SupportedFileFormats = FileFormatV7 | FileFormatV6 | FileFormatV5 | FileFormatV4

export interface FileFormatV7 {
  version: 7
  history: ConversationV7[]
  folders: FolderInterfaceV4[]
  prompts: PromptV5[]
}

export interface FileFormatV6 {
  version: 6
  history: ConversationV6[]
  folders: FolderInterfaceV4[]
  prompts: PromptV5[]
}

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

export interface ConversationV7 {
  id: string
  name: string
  messages: MessageV6[]
  modelId: string
  prompt: string
  temperature: number
  folderId: string | undefined
  time: number
  reasoningEffort: string
}

export interface ConversationV6 {
  id: string
  name: string
  messages: MessageV5[]
  modelId: string // Changed to string in V5.
  prompt: string
  temperature: number
  folderId: string | undefined
  time: number
}

export interface ConversationV5 {
  id: string
  name: string
  messages: MessageV4[]
  modelId: string // Changed to string in V5.
  prompt: string
  temperature: number
  folderId: string | undefined
  time: number
}

export interface PromptV5 {
  // modelId was dropped (non-breaking change).
  id: string
  name: string
  description: string
  content: string
  folderId: string | undefined
  factory: boolean | undefined
}

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

export interface MessagePartTextV1 {
  type: "text"
  text: string
}

export interface ImageUrlV1 {
  url: string
  detail?: "auto" | "low" | "high"
}

export interface MessagePartImageV1 {
  type: "image_url"
  image_url: ImageUrlV1
}

export type MessagePartV1 = MessagePartTextV1 | MessagePartImageV1

export interface UserMessageV1 {
  role: "user"
  content: string | MessagePartV1[]
  name?: string
}

export interface SystemMessageV1 {
  role: "system"
  content: string
  name?: string
}

export interface AssistantMessageV1 {
  role: "assistant"
  content?: string | null
  name?: string
}

export interface ToolMessageV1 {
  role: "tool"
  content: string
  tool_call_id: string
  name?: string
}

export interface DeveloperMessageV1 {
  role: "developer"
  content?: string | null
  name?: string
}

export type MessageV6 = UserMessageV1 | SystemMessageV1 | AssistantMessageV1 | ToolMessageV1 | DeveloperMessageV1

export type MessageV5 = UserMessageV1 | SystemMessageV1 | AssistantMessageV1 | ToolMessageV1

export interface MessageV4 {
  role: RoleV4
  content: string
}

export type RoleV7 = "system" | "assistant" | "user" | "tool" | "developer"

export type RoleV5 = "system" | "assistant" | "user" | "tool"

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
