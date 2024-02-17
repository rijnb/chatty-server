import {Conversation} from "@/types/chat"
import {ErrorMessage} from "@/types/error"
import {FolderInterface} from "@/types/folder"
import {FALLBACK_OPENAI_MODEL, OpenAIModel} from "@/types/openai"
import {Prompt} from "@/types/prompt"
import {Tool, ToolConfigurations} from "@/utils/app/tools"

export interface HomeInitialState {
  apiKey: string
  loading: boolean
  messageIsStreaming: boolean
  modelError: ErrorMessage | null
  models: OpenAIModel[]
  tools: Tool[]
  toolConfigurations: ToolConfigurations
  folders: FolderInterface[]
  conversations: Conversation[]
  selectedConversation: Conversation | undefined
  prompts: Prompt[]
  temperature: number
  showChatBar: boolean
  showPromptBar: boolean
  currentFolder: FolderInterface | undefined
  messageError: boolean
  searchTerm: string
  defaultModelId: string
  serverSideApiKeyIsSet: boolean
  triggerSelectedPrompt: Prompt | undefined // Used to pop-up the prompt execution modal.
  triggerFactoryPrompts: boolean // Used to trigger re-reading the factory prompts.
  reuseModel: boolean
}

export const initialState: HomeInitialState = {
  apiKey: "",
  loading: false,
  messageIsStreaming: false,
  modelError: null,
  models: [],
  tools: [],
  toolConfigurations: {},
  folders: [],
  conversations: [],
  selectedConversation: undefined,
  prompts: [],
  temperature: 1,
  showPromptBar: true,
  showChatBar: true,
  currentFolder: undefined,
  messageError: false,
  searchTerm: "",
  defaultModelId: FALLBACK_OPENAI_MODEL,
  serverSideApiKeyIsSet: false,
  triggerSelectedPrompt: undefined,
  triggerFactoryPrompts: true,
  reuseModel: false
}
