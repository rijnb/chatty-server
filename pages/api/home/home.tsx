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
import {
  createNewConversation,
  getConversationsHistory,
  getSelectedConversation,
  saveConversationsHistory,
  saveSelectedConversation,
  updateConversation
} from "@/utils/app/conversation"
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
  const contextValue = useCreateReducer<HomeInitialState>({
    initialState
  })

  const {
    state: {apiKey, unlockCode, lightMode, folders, conversations, selectedConversation, prompts, temperature},
    dispatch
  } = contextValue

  const stopConversationRef = useRef<boolean>(false)

  const {data, error, refetch} = useQuery(
    ["GetModels", apiKey, serverSideApiKeyIsSet, unlockCode, !serverSideUnlockCodeIsSet],
    ({signal}) => {
      if (!unlockCode && serverSideUnlockCodeIsSet) {
        return null
      }
      if (!apiKey && !serverSideApiKeyIsSet) {
        return null
      }
      return getModels({key: apiKey}, unlockCode, signal)
    },
    {enabled: true, refetchOnMount: false}
  )

  useEffect(() => {
    if (data) {
      console.log("data", data)
      dispatch({field: "models", value: data})
    }
  }, [data, dispatch])

  useEffect(() => {
    dispatch({field: "modelError", value: getModelsError(error)})
  }, [error, dispatch, getModelsError])

  // FETCH MODELS ----------------------------------------------

  const handleSelectConversation = (conversation: Conversation) => {
    dispatch({
      field: "selectedConversation",
      value: conversation
    })

    saveSelectedConversation(conversation)
  }

  // FOLDER OPERATIONS  --------------------------------------------

  const handleCreateFolder = (name: string, type: FolderType) => {
    const updatedFolders = [...folders, createNewFolder(name, type)]

    dispatch({field: "folders", value: updatedFolders})
    saveFolders(updatedFolders)
  }

  const handleDeleteFolder = (folderId: string) => {
    const updatedFolders = folders.filter((f) => f.id !== folderId)
    dispatch({field: "folders", value: updatedFolders})
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

    dispatch({field: "conversations", value: updatedConversations})
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

    dispatch({field: "prompts", value: updatedPrompts})
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

    dispatch({field: "folders", value: updatedFolders})
    saveFolders(updatedFolders)
  }

  // CONVERSATION OPERATIONS  --------------------------------------------

  const handleNewConversation = () => {
    const lastConversation = conversations[conversations.length - 1]

    const newConversation = createNewConversation(
      t("New conversation"),
      lastConversation?.model ?? OpenAIModels[defaultModelId],
      lastConversation?.temperature
    )

    const updatedConversations = [...conversations, newConversation]

    dispatch({field: "selectedConversation", value: newConversation})
    dispatch({field: "conversations", value: updatedConversations})

    saveSelectedConversation(
      createNewConversation(
        t("New conversation"),
        lastConversation?.model ?? OpenAIModels[defaultModelId],
        lastConversation?.temperature
      )
    )
    saveConversationsHistory(updatedConversations)

    dispatch({field: "loading", value: false})
  }

  const handleUpdateConversation = (conversation: Conversation, data: KeyValuePair) => {
    const updatedConversation = {
      ...conversation,
      [data.key]: data.value
    }

    const {selected, history} = updateConversation(updatedConversation, conversations)

    dispatch({field: "selectedConversation", value: selected})
    dispatch({field: "conversations", value: history})
  }

  // EFFECTS  --------------------------------------------

  useEffect(() => {
    if (window.innerWidth < 640) {
      dispatch({field: "showChatBar", value: false})
    }
  }, [selectedConversation, dispatch])

  useEffect(() => {
    defaultModelId && dispatch({field: "defaultModelId", value: defaultModelId})
    serverSideApiKeyIsSet &&
      dispatch({
        field: "serverSideApiKeyIsSet",
        value: serverSideApiKeyIsSet
      })
    serverSidePluginKeysSet &&
      dispatch({
        field: "serverSidePluginKeysSet",
        value: serverSidePluginKeysSet
      })
    serverSideUnlockCodeIsSet &&
      dispatch({
        field: "serverSideUnlockCodeIsSet",
        value: serverSideUnlockCodeIsSet
      })
  }, [defaultModelId, serverSideApiKeyIsSet, serverSidePluginKeysSet, serverSideUnlockCodeIsSet, dispatch])

  // ON LOAD --------------------------------------------

  useEffect(() => {
    const settings = getSettings()
    if (settings.theme) {
      dispatch({
        field: "lightMode",
        value: settings.theme
      })
    }

    const apiKey = getApiKey()
    const unlockCode = getUnlockCode()

    if (serverSideApiKeyIsSet) {
      dispatch({field: "apiKey", value: ""})
      removeApiKey()
    } else if (apiKey) {
      dispatch({field: "apiKey", value: apiKey})
    }

    if (!serverSideUnlockCodeIsSet) {
      dispatch({field: "unlockCode", value: ""})
      removeUnlockCode()
    } else if (unlockCode) {
      dispatch({field: "unlockCode", value: unlockCode})
    }

    const pluginKeys = getPluginKeys()
    if (serverSidePluginKeysSet) {
      dispatch({field: "pluginKeys", value: []})
      removePluginKeys()
    } else if (pluginKeys) {
      dispatch({field: "pluginKeys", value: pluginKeys})
    }

    if (window.innerWidth < 640) {
      dispatch({field: "showChatBar", value: false})
      dispatch({field: "showPromptBar", value: false})
    }

    const showChatBar = getShowChatBar()
    if (showChatBar) {
      dispatch({field: "showChatBar", value: showChatBar})
    }

    const showPromptBar = getShowPromptBar()
    if (showPromptBar) {
      dispatch({field: "showPromptBar", value: showPromptBar})
    }

    const folders = getFolders()
    if (folders) {
      dispatch({field: "folders", value: folders})
    }

    const prompts = getPrompts()
    if (prompts) {
      dispatch({field: "prompts", value: prompts})
    }

    const conversationsHistory: Conversation[] = getConversationsHistory()
    const cleanedConversationHistory = cleanConversationHistory(conversationsHistory)
    dispatch({field: "conversations", value: cleanedConversationHistory})

    const selectedConversation = getSelectedConversation()
    if (selectedConversation) {
      const cleanedSelectedConversation = cleanSelectedConversation(selectedConversation)
      dispatch({field: "selectedConversation", value: cleanedSelectedConversation})
    } else {
      const lastConversation = conversations[conversations.length - 1]
      dispatch({
        field: "selectedConversation",
        value: createNewConversation(t("New conversation"), OpenAIModels[defaultModelId], lastConversation?.temperature)
      })
    }
  }, [defaultModelId, dispatch, serverSideApiKeyIsSet, serverSideUnlockCodeIsSet, serverSidePluginKeysSet, dispatch])

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
export default Home

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