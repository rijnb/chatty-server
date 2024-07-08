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

import {OPENAI_DEFAULT_SYSTEM_PROMPT, OPENAI_DEFAULT_TEMPERATURE} from "./const"
import {Conversation} from "@/types/chat"
import {OpenAIModel} from "@/types/openai"

export const cleanSelectedConversation = (
  conversation: Conversation,
  models: OpenAIModel[],
  defaultModelId: string,
  allowModelSelection: boolean
) => {
  let updatedConversation = conversation
  if (!allowModelSelection || (conversation.modelId && !models.find((model) => model.id === conversation.modelId))) {
    updatedConversation = {
      ...conversation,
      modelId: defaultModelId
    }
  }
  if (!updatedConversation.modelId) {
    updatedConversation = {
      ...updatedConversation,
      modelId: updatedConversation.modelId ?? defaultModelId
    }
  }
  if (!updatedConversation.prompt) {
    updatedConversation = {
      ...updatedConversation,
      prompt: updatedConversation.prompt ?? OPENAI_DEFAULT_SYSTEM_PROMPT
    }
  }
  if (updatedConversation.temperature === undefined || updatedConversation.temperature === null) {
    updatedConversation = {
      ...updatedConversation,
      temperature: updatedConversation.temperature ?? OPENAI_DEFAULT_TEMPERATURE
    }
  }
  if (!updatedConversation.folderId) {
    updatedConversation = {
      ...updatedConversation,
      folderId: updatedConversation.folderId ?? undefined
    }
  }
  if (!updatedConversation.messages) {
    updatedConversation = {
      ...updatedConversation,
      messages: updatedConversation.messages ?? []
    }
  }
  return updatedConversation
}

export const cleanConversationHistory = (history: Conversation[], defaultModelId: string): Conversation[] => {
  if (!Array.isArray(history)) {
    console.warn("Error: History is not an array. Returning an empty array.")
    return []
  }

  return history.reduce((acc: Conversation[], conversation) => {
    try {
      if (!conversation.modelId) {
        conversation.modelId = defaultModelId
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
    } catch (error) {
      console.warn(`Error: Error while cleaning conversations history. Removing culprit:`, error)
    }
    return acc
  }, [])
}
