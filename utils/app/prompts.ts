import {OpenAIModel} from "@/types/openai"
import {Prompt} from "@/types/prompt"

import {v4 as uuidv4} from "uuid"


export const createNewPrompt = (name: string, model: OpenAIModel): Prompt => {
  return {
    id: uuidv4(),
    name: name,
    description: "",
    content: "",
    model: model,
    folderId: null,
    isSystemPrompt: false,
  }
}

export const savePrompts = (prompts: Prompt[]) => {
  localStorage.setItem("prompts", JSON.stringify(prompts))
}