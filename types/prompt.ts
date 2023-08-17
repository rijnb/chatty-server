import {OpenAIModelID} from "@/types/openai"

export interface Prompt {
  id: string
  name: string
  description: string
  content: string
  modelId: OpenAIModelID
  folderId: string | undefined
  factory: boolean | undefined
}
