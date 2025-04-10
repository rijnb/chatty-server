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
import {v4 as uuidv4} from "uuid"

import {Conversation} from "@/types/chat"
import {maxOutputTokensForModel} from "@/types/openai"
import {
  OPENAI_API_MAX_TOKENS,
  OPENAI_DEFAULT_REASONING_EFFORT,
  OPENAI_DEFAULT_SYSTEM_PROMPT,
  OPENAI_DEFAULT_TEMPERATURE
} from "@/utils/app/const"
import {localStorageSafeGetItem, localStorageSafeRemoveItem, localStorageSafeSetItem} from "@/utils/app/storage"

export const LOCAL_STORAGE_SELECTED_CONVERSATION = "selectedConversation"
export const STORAGE_KEY_HISTORY = "history"

export const createNewConversation = (
  name: string,
  modelId: string,
  temperature: number,
  reasoningEffort: string
): Conversation => {
  return {
    id: uuidv4(),
    name: name,
    messages: [],
    tokenCount: 0,
    modelId: modelId,
    prompt: OPENAI_DEFAULT_SYSTEM_PROMPT,
    temperature: temperature,
    maxTokens: maxOutputTokensForModel(modelId) || OPENAI_API_MAX_TOKENS,
    folderId: undefined,
    time: new Date().getTime(),
    reasoningEffort: reasoningEffort
  }
}

export const getSelectedConversation = (): Conversation | undefined => {
  const conversationString = localStorageSafeGetItem(LOCAL_STORAGE_SELECTED_CONVERSATION)
  try {
    const conversation = conversationString ? JSON.parse(conversationString) : undefined
    return conversation ? {...conversation, maxTokens: maxOutputTokensForModel(conversation.modelId)} : undefined
  } catch (error) {
    console.error(`Local storage error:${error}`)
    return undefined
  }
}

export const saveSelectedConversation = (conversation: Conversation) =>
  localStorageSafeSetItem(LOCAL_STORAGE_SELECTED_CONVERSATION, JSON.stringify(conversation))

export const removeSelectedConversation = () => localStorageSafeRemoveItem(LOCAL_STORAGE_SELECTED_CONVERSATION)

export const getConversationsHistory = (): Conversation[] => {
  const conversationsAsString = localStorageSafeGetItem(STORAGE_KEY_HISTORY)
  try {
    return conversationsAsString ? JSON.parse(conversationsAsString) : []
  } catch (error) {
    console.error(`Local storage error:${error}`)
    return []
  }
}

export const saveConversationsHistory = (conversations: Conversation[]) =>
  localStorageSafeSetItem(STORAGE_KEY_HISTORY, JSON.stringify(conversations))

export const removeConversationsHistory = () => localStorageSafeRemoveItem(STORAGE_KEY_HISTORY)

export const updateConversationHistory = (conversationHistory: Conversation[], conversation: Conversation) => {
  const updatedConversationHistory = conversationHistory.map((conversationInHistory) =>
    conversationInHistory.id === conversation.id ? conversation : conversationInHistory
  )
  saveSelectedConversation(conversation)
  saveConversationsHistory(updatedConversationHistory)
  return updatedConversationHistory
}
