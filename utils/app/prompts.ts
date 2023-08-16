import {OpenAIModel} from "@/types/openai"
import {Prompt} from "@/types/prompt"
import {v4 as uuidv4} from "uuid"


export const STORAGE_KEY_PROMPTS = "prompts"

export const createNewPrompt = (name: string, model: OpenAIModel): Prompt => {
  return {
    id: uuidv4(),
    name: name,
    description: "",
    content: "",
    model: model,
    folderId: undefined,
    factory : undefined
  }
}

export const savePrompts = (prompts: Prompt[]) => {
  localStorage.setItem(STORAGE_KEY_PROMPTS, JSON.stringify(prompts))
}

export const getPrompts = (): Prompt[] => {
  const promptsAsString = localStorage.getItem(STORAGE_KEY_PROMPTS)
  try {
    return promptsAsString ? (JSON.parse(promptsAsString) as Prompt[]) : []
  } catch (error) {
    console.error(`Local storage error:${error}`)
    return []
  }
}

export const removePrompts = () => localStorage.removeItem(STORAGE_KEY_PROMPTS)