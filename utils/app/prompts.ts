import {Prompt} from "@/types/prompt"

export const savePrompts = (prompts: Prompt[]) => {
  localStorage.setItem("prompts", JSON.stringify(prompts))
}