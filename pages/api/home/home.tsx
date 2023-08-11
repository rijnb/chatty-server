import {useEffect, useRef} from "react"
import {useQuery} from "react-query"
import {GetServerSideProps} from "next"
import {useTranslation} from "next-i18next"
import {serverSideTranslations} from "next-i18next/serverSideTranslations"
import Head from "next/head"
import {useRouter} from "next/router"
import {useCreateReducer} from "@/hooks/useCreateReducer"
import useErrorService from "@/services/errorService"
import useApiService from "@/services/useApiService"
import {cleanConversationHistory, cleanSelectedConversation} from "@/utils/app/clean"
import {OPENAI_DEFAULT_TEMPERATURE} from "@/utils/app/const"
import {
  createNewConversation,
  getConversationsHistory,
  getSelectedConversation,
  saveConversationsHistory,
  saveSelectedConversation,
  updateConversationHistory
} from "@/utils/app/conversations"
import {createNewFolder, getFolders, saveFolders} from "@/utils/app/folders"
import {importJsonData} from "@/utils/app/import"
import {getPluginKeys, removePluginKeys} from "@/utils/app/plugins"
import {getPrompts, savePrompts} from "@/utils/app/prompts"
import {getApiKey, getShowChatBar, getShowPromptBar, removeApiKey} from "@/utils/app/settings"
import {Conversation} from "@/types/chat"
import {KeyValuePair} from "@/types/data"
import {LatestFileFormat} from "@/types/export"
import {FolderType} from "@/types/folder"
import {OpenAIModelID, OpenAIModels, fallbackOpenAIModel} from "@/types/openai"
import {Prompt} from "@/types/prompt"
import {Chat} from "@/components/Chat/Chat"
import {ChatBar} from "@/components/ChatBar/ChatBar"
import {Navbar} from "@/components/Mobile/Navbar"
import PromptBar from "@/components/PromptBar"
import {useUnlock} from "@/components/UnlockCode"
import HomeContext from "./home.context"
import {HomeInitialState, initialState} from "./home.state"

interface Props {
  serverSideApiKeyIsSet: boolean
  serverSidePluginKeysSet: boolean
  defaultModelId: OpenAIModelID
}

const Home = ({serverSideApiKeyIsSet, serverSidePluginKeysSet, defaultModelId}: Props) => {
  const {t} = useTranslation("chat")
  const {getModels} = useApiService()
  const {getModelsError} = useErrorService()
  const contextValue = useCreateReducer<HomeInitialState>({initialState})
  const router = useRouter()
  const {unlocked} = useUnlock()

  const {
    state: {apiKey, folders, conversations, selectedConversation, prompts, triggerFactoryPrompts},
    dispatch: homeDispatch
  } = contextValue

  const {data: modelData, error} = useQuery(
    ["GetModels", apiKey, serverSideApiKeyIsSet, unlocked],
    ({signal}) => {
      if (!unlocked) {
        return null
      } else if (!apiKey && !serverSideApiKeyIsSet) {
        return null
      } else {
        return getModels({key: apiKey}, signal)
      }
    },
    {enabled: true, refetchOnMount: false, refetchOnWindowFocus: false, staleTime: 5 * 60 * 1000}
  )

  const stopConversationRef = useRef<boolean>(false)

  // FOLDER OPERATIONS  --------------------------------------------

  const handleCreateFolder = (name: string, type: FolderType) => {
    const updatedFolders = [...folders, createNewFolder(name, type)]

    homeDispatch({field: "folders", value: updatedFolders})
    saveFolders(updatedFolders)
  }

  const handleDeleteFolder = (folderId: string) => {
    const updatedFolders = folders.filter((f) => f.id !== folderId)
    homeDispatch({field: "folders", value: updatedFolders})
    saveFolders(updatedFolders)

    const updatedConversations: Conversation[] = conversations.map((conversation) => {
      if (conversation.folderId === folderId) {
        return {
          ...conversation,
          folderId: null
        }
      }
      return conversation
    })

    homeDispatch({field: "conversations", value: updatedConversations})
    saveConversationsHistory(updatedConversations)

    const updatedPrompts: Prompt[] = prompts.map((prompt) => {
      if (prompt.folderId === folderId) {
        return {
          ...prompt,
          folderId: null
        }
      }
      return prompt
    })

    homeDispatch({field: "prompts", value: updatedPrompts})
    savePrompts(updatedPrompts)
  }

  const handleUpdateFolder = (folderId: string, name: string) => {
    const updatedFolders = folders.map((folder) => {
      if (folder.id === folderId) {
        return {
          ...folder,
          name
        }
      }
      return folder
    })

    homeDispatch({field: "folders", value: updatedFolders})
    saveFolders(updatedFolders)
  }

  // CONVERSATION OPERATIONS  --------------------------------------------

  const handleSelectConversation = (conversation: Conversation) => {
    homeDispatch({
      field: "selectedConversation",
      value: conversation
    })
    saveSelectedConversation(conversation)
  }

  const handleNewConversation = () => {
    const lastConversation = conversations.length > 0 ? conversations[conversations.length - 1] : undefined
    const newConversation = createNewConversation(
      t("New conversation"),
      lastConversation?.model ?? OpenAIModels[defaultModelId],
      lastConversation?.temperature ?? OPENAI_DEFAULT_TEMPERATURE
    )
    const updatedConversations = [...conversations, newConversation]

    homeDispatch({field: "selectedConversation", value: newConversation})
    homeDispatch({field: "conversations", value: updatedConversations})

    saveSelectedConversation(newConversation)
    saveConversationsHistory(updatedConversations)

    homeDispatch({field: "loading", value: false})
  }

  const handleUpdateConversation = (conversation: Conversation, data: KeyValuePair) => {
    const updatedConversation = {
      ...conversation,
      [data.key]: data.value
    }

    const conversationHistory = updateConversationHistory(updatedConversation, conversations)
    homeDispatch({field: "selectedConversation", value: updatedConversation})
    homeDispatch({field: "conversations", value: conversationHistory})
  }

  // EFFECTS  --------------------------------------------

  // Read factory prompts file.
  useEffect(() => {
    const filename = `${router.basePath}/factory-prompts.json`
    if (triggerFactoryPrompts) {
      console.debug(`useEffect: triggerFactoryPrompts`)
      homeDispatch({field: "triggerFactoryPrompts", value: false})
      fetch(filename)
        .then((response) => response.text())
        .then((text) => {
          let factoryData: LatestFileFormat = JSON.parse(text)
          const {folders, prompts}: LatestFileFormat = importJsonData(factoryData, true)
          homeDispatch({field: "folders", value: folders})
          homeDispatch({field: "prompts", value: prompts})
        })
        .catch((error) => console.error(`Error fetching factory prompts file: ${error}`))
    }
  }, [triggerFactoryPrompts])

  // Retrieved models from API.
  useEffect(() => {
    console.debug("useEffect: modelData")
    if (modelData) {
      homeDispatch({field: "models", value: modelData})
    }
  }, [modelData, homeDispatch])

  // Error retrieving models from API.
  useEffect(() => {
    console.debug("useEffect: error")
    homeDispatch({field: "modelError", value: getModelsError(error)})
  }, [error, homeDispatch])

  // Server side props changed.
  useEffect(() => {
    apiKey && homeDispatch({field: "apiKey", value: apiKey})
    serverSideApiKeyIsSet &&
      homeDispatch({
        field: "serverSideApiKeyIsSet",
        value: serverSideApiKeyIsSet
      })
    serverSidePluginKeysSet &&
      homeDispatch({
        field: "serverSidePluginKeysSet",
        value: serverSidePluginKeysSet
      })
  }, [apiKey, defaultModelId, serverSideApiKeyIsSet, serverSidePluginKeysSet, homeDispatch])

  // Load settings from local storage.
  useEffect(() => {
    console.debug("useEffect: server-side props changed")
    const apiKey = getApiKey()

    serverSideApiKeyIsSet &&
      homeDispatch({
        field: "serverSideApiKeyIsSet",
        value: serverSideApiKeyIsSet
      })
    serverSidePluginKeysSet &&
      homeDispatch({
        field: "serverSidePluginKeysSet",
        value: serverSidePluginKeysSet
      })

    defaultModelId &&
      homeDispatch({
        field: "defaultModelId",
        value: defaultModelId
      })

    if (serverSideApiKeyIsSet) {
      homeDispatch({field: "apiKey", value: ""})
      removeApiKey()
    } else if (apiKey) {
      homeDispatch({field: "apiKey", value: apiKey})
    }

    const pluginKeys = getPluginKeys()
    if (serverSidePluginKeysSet) {
      homeDispatch({field: "pluginKeys", value: []})
      removePluginKeys()
    } else if (pluginKeys) {
      homeDispatch({field: "pluginKeys", value: pluginKeys})
    }

    if (window.innerWidth < 640) {
      homeDispatch({field: "showChatBar", value: false})
      homeDispatch({field: "showPromptBar", value: false})
    }

    const showChatBar = getShowChatBar()
    if (showChatBar) {
      homeDispatch({field: "showChatBar", value: showChatBar})
    }

    const showPromptBar = getShowPromptBar()
    if (showPromptBar) {
      homeDispatch({field: "showPromptBar", value: showPromptBar})
    }

    const folders = getFolders()
    if (folders) {
      homeDispatch({field: "folders", value: folders})
    }

    const prompts = getPrompts()
    if (prompts) {
      homeDispatch({field: "prompts", value: prompts})
    }

    const conversationsHistory: Conversation[] = getConversationsHistory()
    const cleanedConversationHistory = cleanConversationHistory(conversationsHistory)
    homeDispatch({field: "conversations", value: cleanedConversationHistory})

    const selectedConversation = getSelectedConversation()
    if (selectedConversation) {
      const cleanedSelectedConversation = cleanSelectedConversation(selectedConversation)
      homeDispatch({field: "selectedConversation", value: cleanedSelectedConversation})
    } else {
      const lastConversation = conversations.length > 0 ? conversations[conversations.length - 1] : undefined
      homeDispatch({
        field: "selectedConversation",
        value: createNewConversation(
          t("New conversation"),
          lastConversation?.model ?? OpenAIModels[defaultModelId],
          lastConversation?.temperature ?? OPENAI_DEFAULT_TEMPERATURE
        )
      })
    }
  }, [defaultModelId, serverSideApiKeyIsSet, serverSidePluginKeysSet, homeDispatch])

  // LAYOUT --------------------------------------------

  const title = "Chatty"
  return (
    <HomeContext.Provider
      value={{
        ...contextValue,
        handleNewConversation,
        handleCreateFolder,
        handleDeleteFolder,
        handleUpdateFolder,
        handleSelectConversation,
        handleUpdateConversation
      }}
    >
      <Head>
        <title>{title}</title>
        <meta name="description" content="ChatGPT but better." />
        <meta name="viewport" content="height=device-height ,width=device-width, initial-scale=1, user-scalable=no" />
        <link rel="icon" href={`${router.basePath}/favicon.ico`} />
      </Head>
      {selectedConversation && (
        <main className={`flex h-screen w-screen flex-col text-sm text-black dark:text-white`}>
          <div className="flex h-full w-full overflow-y-hidden pt-0">
            <ChatBar />
            <div className="flex flex-1">
              <Chat stopConversationRef={stopConversationRef} />
            </div>
            <PromptBar />
          </div>
        </main>
      )}
    </HomeContext.Provider>
  )
}

export const getServerSideProps: GetServerSideProps = async ({locale}) => {
  const defaultModelId =
    (process.env.OPENAI_DEFAULT_MODEL &&
      Object.values(OpenAIModelID).includes(process.env.OPENAI_DEFAULT_MODEL as OpenAIModelID) &&
      process.env.OPENAI_DEFAULT_MODEL) ||
    fallbackOpenAIModel.id

  let serverSidePluginKeysSet = false
  const googleApiKey = process.env.GOOGLE_API_KEY
  const googleCSEId = process.env.GOOGLE_CSE_ID
  if (googleApiKey && googleCSEId) {
    serverSidePluginKeysSet = true
  }
  return {
    props: {
      serverSideApiKeyIsSet: !!process.env.OPENAI_API_KEY,
      defaultModelId,
      serverSidePluginKeysSet,
      ...(await serverSideTranslations(locale ?? "en", ["common", "chat", "sidebar", "markdown", "promptbar"]))
    }
  }
}

export default Home
