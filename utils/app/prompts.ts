import {v4 as uuidv4} from "uuid"

import {Prompt} from "@/types/prompt"
import {localStorageSafeGetItem, localStorageSafeRemoveItem, localStorageSafeSetItem} from "@/utils/app/storage"

export const STORAGE_KEY_PROMPTS = "prompts"

export const createNewPrompt = (name: string): Prompt => {
  return {
    id: uuidv4(),
    name: name,
    description: "",
    content: "",
    folderId: undefined,
    factory: undefined
  }
}

export const savePrompts = (prompts: Prompt[]) => {
  localStorageSafeSetItem(STORAGE_KEY_PROMPTS, JSON.stringify(prompts))
}

export const getPrompts = (): Prompt[] => {
  const promptsAsString = localStorageSafeGetItem(STORAGE_KEY_PROMPTS)
  try {
    return promptsAsString ? (JSON.parse(promptsAsString) as Prompt[]) : []
  } catch (error) {
    console.error(`Local storage error:${error}`)
    return []
  }
}

export const removePrompts = () => localStorageSafeRemoveItem(STORAGE_KEY_PROMPTS)
