import {OPENAI_DEFAULT_SYSTEM_PROMPT, OPENAI_DEFAULT_TEMPERATURE} from "./const"
import {Conversation} from "@/types/chat"
import {FALLBACK_OPENAI_MODEL_ID} from "@/types/openai"

export const cleanSelectedConversation = (conversation: Conversation) => {
  let updatedConversation = conversation
  if (!updatedConversation.modelId) {
    updatedConversation = {
      ...updatedConversation,
      modelId: updatedConversation.modelId || FALLBACK_OPENAI_MODEL_ID
    }
  }
  if (!updatedConversation.prompt) {
    updatedConversation = {
      ...updatedConversation,
      prompt: updatedConversation.prompt || OPENAI_DEFAULT_SYSTEM_PROMPT
    }
  }
  if (updatedConversation.temperature === undefined || updatedConversation.temperature === null) {
    updatedConversation = {
      ...updatedConversation,
      temperature: updatedConversation.temperature || OPENAI_DEFAULT_TEMPERATURE
    }
  }
  if (!updatedConversation.folderId) {
    updatedConversation = {
      ...updatedConversation,
      folderId: updatedConversation.folderId || undefined
    }
  }
  if (!updatedConversation.messages) {
    updatedConversation = {
      ...updatedConversation,
      messages: updatedConversation.messages || []
    }
  }
  return updatedConversation
}

export const cleanConversationHistory = (history: Conversation[]): Conversation[] => {
  if (!Array.isArray(history)) {
    console.warn("Error: History is not an array. Returning an empty array.")
    return []
  }

  return history.reduce((acc: Conversation[], conversation) => {
    try {
      if (!conversation.modelId) {
        conversation.modelId = FALLBACK_OPENAI_MODEL_ID
      }
      if (!conversation.prompt) {
        conversation.prompt = OPENAI_DEFAULT_SYSTEM_PROMPT
      }
      if (!conversation.temperature) {
        conversation.temperature = OPENAI_DEFAULT_TEMPERATURE
      }
      if (!conversation.folderId) {
        conversation.folderId = undefined
      }
      if (!conversation.messages) {
        conversation.messages = []
      }
      acc.push(conversation)
      return acc
    } catch (error) {
      console.warn(`Error: Error while cleaning conversations history. Removing culprit:`, error)
    }
    return acc
  }, [])
}
