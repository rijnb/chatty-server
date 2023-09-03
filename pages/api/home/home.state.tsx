import {Conversation, Message} from "@/types/chat"
import {ErrorMessage} from "@/types/error"
import {FolderInterface} from "@/types/folder"
import {OpenAIModel, OpenAIModelID} from "@/types/openai"
import {PluginKey} from "@/types/plugin"
import {Prompt} from "@/types/prompt"

export interface HomeInitialState {
  apiKey: string
  pluginKeys: PluginKey[]
  loading: boolean
  messageIsStreaming: boolean
  modelError: ErrorMessage | null
  models: OpenAIModel[]
  folders: FolderInterface[]
  conversations: Conversation[]
  selectedConversation: Conversation | undefined
  currentMessage: Message | undefined
  prompts: Prompt[]
  temperature: number
  showChatBar: boolean
  showPromptBar: boolean
  currentFolder: FolderInterface | undefined
  messageError: boolean
  searchTerm: string
  defaultModelId: OpenAIModelID | undefined
  serverSideApiKeyIsSet: boolean
  serverSidePluginKeysSet: boolean
  triggerSelectedPrompt: Prompt | undefined // Used to pop-up the prompt execution modal.
  triggerFactoryPrompts: boolean // Used to trigger re-reading the factory prompts.
}

export const initialState: HomeInitialState = {
  apiKey: "",
  loading: false,
  pluginKeys: [],
  messageIsStreaming: false,
  modelError: null,
  models: [],
  folders: [],
  conversations: [],
  selectedConversation: undefined,
  currentMessage: undefined,
  prompts: [],
  temperature: 1,
  showPromptBar: true,
  showChatBar: true,
  currentFolder: undefined,
  messageError: false,
  searchTerm: "",
  defaultModelId: undefined,
  serverSideApiKeyIsSet: false,
  serverSidePluginKeysSet: false,
  triggerSelectedPrompt: undefined,
  triggerFactoryPrompts: true
}
