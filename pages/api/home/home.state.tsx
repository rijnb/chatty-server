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

import {Conversation, Message} from "@/types/chat"
import {ErrorMessage} from "@/types/error"
import {FolderInterface} from "@/types/folder"
import {FALLBACK_OPENAI_MODEL, OpenAIModel} from "@/types/openai"
import {PluginKey} from "@/types/plugin"
import {Prompt} from "@/types/prompt"

export interface HomeInitialState {
  apiKey: string
  pluginKeys: PluginKey[]
  loading: boolean
  messageIsStreaming: boolean
  modelError: ErrorMessage | null
  models: OpenAIModel[]
  folders: FolderInterface[]
  conversations: Conversation[]
  selectedConversation: Conversation | undefined
  currentMessage: Message | undefined
  prompts: Prompt[]
  temperature: number
  showChatBar: boolean
  showPromptBar: boolean
  currentFolder: FolderInterface | undefined
  messageError: boolean
  searchTerm: string
  defaultModelId: string
  serverSideApiKeyIsSet: boolean
  serverSidePluginKeysSet: boolean
  triggerSelectedPrompt: Prompt | undefined // Used to pop-up the prompt execution modal.
  triggerFactoryPrompts: boolean // Used to trigger re-reading the factory prompts.
  reuseModel: boolean
  allowModelSelection: boolean
}

export const initialState: HomeInitialState = {
  apiKey: "",
  pluginKeys: [],
  loading: false,
  messageIsStreaming: false,
  modelError: null,
  models: [],
  folders: [],
  conversations: [],
  selectedConversation: undefined,
  currentMessage: undefined,
  prompts: [],
  temperature: 1,
  showPromptBar: true,
  showChatBar: true,
  currentFolder: undefined,
  messageError: false,
  searchTerm: "",
  defaultModelId: FALLBACK_OPENAI_MODEL,
  serverSideApiKeyIsSet: false,
  serverSidePluginKeysSet: false,
  triggerSelectedPrompt: undefined,
  triggerFactoryPrompts: true,
  reuseModel: true,
  allowModelSelection: true
}
