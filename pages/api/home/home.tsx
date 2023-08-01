import {useEffect, useRef} from "react"
import {useQuery} from "react-query"
import {GetServerSideProps} from "next"
import {useTranslation} from "next-i18next"
import {serverSideTranslations} from "next-i18next/serverSideTranslations"
import Head from "next/head"
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
import {getPluginKeys, removePluginKeys} from "@/utils/app/plugins"
import {getPrompts, savePrompts} from "@/utils/app/prompts"
import {
  getApiKey,
  getSettings,
  getShowChatBar,
  getShowPromptBar,
  getUnlockCode,
  removeApiKey,
  removeUnlockCode
} from "@/utils/app/settings"
import {Conversation} from "@/types/chat"
import {KeyValuePair} from "@/types/data"
import {FolderType} from "@/types/folder"
import {OpenAIModelID, OpenAIModels, fallbackOpenAIModel} from "@/types/openai"
import {Prompt} from "@/types/prompt"
import {Chat} from "@/components/Chat/Chat"
import {ChatBar} from "@/components/ChatBar/ChatBar"
import {Navbar} from "@/components/Mobile/Navbar"
import PromptBar from "@/components/PromptBar"
import HomeContext from "./home.context"
import {HomeInitialState, initialState} from "./home.state"


interface Props {
  serverSideApiKeyIsSet: boolean
  serverSideUnlockCodeIsSet: boolean
  serverSidePluginKeysSet: boolean
  defaultModelId: OpenAIModelID
}

const Home = ({serverSideApiKeyIsSet, serverSidePluginKeysSet, serverSideUnlockCodeIsSet, defaultModelId}: Props) => {
  const {t} = useTranslation("chat")
  const {getModels} = useApiService()
  const {getModelsError} = useErrorService()
  const contextValue = useCreateReducer<HomeInitialState>({initialState})

  const {
    state: {apiKey, unlockCode, lightMode, folders, conversations, selectedConversation, prompts, temperature},
    dispatch: homeDispatch
  } = contextValue

  const {
    data: modelData,
    error,
    refetch
  } = useQuery(
    ["GetModels", apiKey, serverSideApiKeyIsSet, unlockCode, !serverSideUnlockCodeIsSet],
    ({signal}) => {
      if (!unlockCode && serverSideUnlockCodeIsSet) {
        return null
      } else if (!apiKey && !serverSideApiKeyIsSet) {
        return null
      } else {
        return getModels({key: apiKey}, unlockCode, signal)
      }
    },
    {enabled: true, refetchOnMount: false}
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

  // Retrieved models from API.
  useEffect(() => {
    console.debug("useEffect: modelData") //!! TODO
    if (modelData) {
      homeDispatch({field: "models", value: modelData})
    }
  }, [modelData, homeDispatch])

  // Error retrieving models from API.
  useEffect(() => {
    console.debug("useEffect: error") //!! TODO
    homeDispatch({field: "modelError", value: getModelsError(error)})
  }, [error, homeDispatch, getModelsError])

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
    serverSideUnlockCodeIsSet &&
      homeDispatch({
        field: "serverSideUnlockCodeIsSet",
        value: serverSideUnlockCodeIsSet
      })
  }, [apiKey, defaultModelId, serverSideApiKeyIsSet, serverSidePluginKeysSet, serverSideUnlockCodeIsSet, homeDispatch])

  // Load settings from local storage.
  useEffect(() => {
    console.debug("useEffect: retrieve settings") //!! TODO
    const settings = getSettings()
    if (settings.theme) {
      homeDispatch({
        field: "lightMode",
        value: settings.theme
      })
    }

    const apiKey = getApiKey()
    const unlockCode = getUnlockCode()

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
    serverSideUnlockCodeIsSet &&
      homeDispatch({
        field: "serverSideUnlockCodeIsSet",
        value: serverSideUnlockCodeIsSet
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

    if (!serverSideUnlockCodeIsSet) {
      homeDispatch({field: "unlockCode", value: ""})
      removeUnlockCode()
    } else if (unlockCode) {
      homeDispatch({field: "unlockCode", value: unlockCode})
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
          t("New conversationXXX"),
          lastConversation?.model ?? OpenAIModels[defaultModelId],
          lastConversation?.temperature ?? OPENAI_DEFAULT_TEMPERATURE
        )
      })
    }
  }, [defaultModelId, serverSideApiKeyIsSet, serverSideUnlockCodeIsSet, serverSidePluginKeysSet, homeDispatch])

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
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {selectedConversation && (
        <main className={`flex h-screen w-screen flex-col text-sm text-white dark:text-white ${lightMode}`}>
          <div className="fixed top-0 w-full sm:hidden">
            <Navbar selectedConversation={selectedConversation} onNewConversation={handleNewConversation} />
          </div>

          <div className="flex h-full w-full pt-[48px] sm:pt-0">
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
      serverSideUnlockCodeIsSet: !!process.env.OPENAI_UNLOCK_CODE,
      defaultModelId,
      serverSidePluginKeysSet,
      ...(await serverSideTranslations(locale ?? "en", [
        "common",
        "chat",
        "sidebar",
        "markdown",
        "promptbar",
        "settings"
      ]))
    }
  }
}

export default Home