import {v4 as uuidv4} from "uuid"

import {Conversation} from "@/types/chat"
import {OpenAIModelID} from "@/types/openai"
import {OPENAI_API_MAX_TOKENS, OPENAI_DEFAULT_SYSTEM_PROMPT, OPENAI_DEFAULT_TEMPERATURE} from "@/utils/app/const"
import {localStorageSafeGetItem, localStorageSafeRemoveItem, localStorageSafeSetItem} from "@/utils/app/storage"

export const LOCAL_STORAGE_SELECTED_CONVERSATION = "selectedConversation"
export const STORAGE_KEY_HISTORY = "history"

export const createNewConversation = (name: string, modelId: OpenAIModelID, temperature: number): Conversation => {
  return {
    id: uuidv4(),
    name: name,
    messages: [],
    tokenCount: 0,
    modelId: modelId,
    prompt: OPENAI_DEFAULT_SYSTEM_PROMPT,
    temperature: temperature || OPENAI_DEFAULT_TEMPERATURE,
    maxTokens: OPENAI_API_MAX_TOKENS,
    folderId: undefined,
    time: new Date().getTime()
  }
}

export const getSelectedConversation = (): Conversation | undefined => {
  const conversation = localStorageSafeGetItem(LOCAL_STORAGE_SELECTED_CONVERSATION)
  try {
    return conversation ? JSON.parse(conversation) : undefined
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
