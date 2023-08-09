import {OPENAI_DEFAULT_SYSTEM_PROMPT, OPENAI_DEFAULT_TEMPERATURE} from "@/utils/app/const"
import {Conversation} from "@/types/chat"
import {OpenAIModel} from "@/types/openai"
import {v4 as uuidv4} from "uuid"


export const LOCAL_STORAGE_SELECTED_CONVERSATION = "selectedConversation"
export const STORAGE_KEY_HISTORY = "history"

export const createNewConversation = (name: string, model: OpenAIModel, temperature: number): Conversation => {
  return {
    id: uuidv4(),
    name: name,
    messages: [],
    model: model,
    prompt: OPENAI_DEFAULT_SYSTEM_PROMPT,
    temperature: temperature || OPENAI_DEFAULT_TEMPERATURE,
    folderId: null,
    time: new Date().getTime()
  }
}

export const getSelectedConversation = (): Conversation | null => {
  const conversation = localStorage.getItem(LOCAL_STORAGE_SELECTED_CONVERSATION)
  try {
    return conversation ? JSON.parse(conversation) : undefined
  } catch (error) {
    console.error(`Local storage error:${error}`)
    return null
  }
}

export const saveSelectedConversation = (conversation: Conversation) =>
  localStorage.setItem(LOCAL_STORAGE_SELECTED_CONVERSATION, JSON.stringify(conversation))

export const removeSelectedConversation = () => localStorage.removeItem(LOCAL_STORAGE_SELECTED_CONVERSATION)

export const getConversationsHistory = (): Conversation[] => {
  const conversationsAsString = localStorage.getItem(STORAGE_KEY_HISTORY)
  try {
    return conversationsAsString ? JSON.parse(conversationsAsString) : []
  } catch (error) {
    console.error(`Local storage error:${error}`)
    return []
  }
}

export const saveConversationsHistory = (conversations: Conversation[]) =>
  localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(conversations))

export const removeConversationsHistory = () => localStorage.removeItem(STORAGE_KEY_HISTORY)

export const updateConversationHistory = (conversation: Conversation, conversationHistory: Conversation[]) => {
  const updatedConversationHistory = conversationHistory.map((conversationInHistory) =>
    conversationInHistory.id === conversation.id ? conversation : conversationInHistory
  )
  saveSelectedConversation(conversation)
  saveConversationsHistory(updatedConversationHistory)
  return updatedConversationHistory
}