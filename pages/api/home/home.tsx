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
import {NEW_CONVERSATION_TITLE, OPENAI_DEFAULT_TEMPERATURE} from "@/utils/app/const"
import {
  createNewConversation,
  getConversationsHistory,
  getSelectedConversation,
  saveConversationsHistory,
  saveSelectedConversation,
  updateConversationHistory
} from "@/utils/app/conversations"
import {createNewFolder, getFolders, saveFolders} from "@/utils/app/folders"
import {importData, isValidJsonData} from "@/utils/app/import"
import {getPluginKeys, removePluginKeys} from "@/utils/app/plugins"
import {getPrompts, savePrompts} from "@/utils/app/prompts"
import {getApiKey, getShowChatBar, getShowPromptBar, removeApiKey} from "@/utils/app/settings"
import {numberOfTokensInConversation} from "@/utils/server/tiktoken"
import {Conversation, Message} from "@/types/chat"
import {KeyValuePair} from "@/types/data"
import {FolderType} from "@/types/folder"
import {FALLBACK_OPENAI_MODEL_ID, OpenAIModelID} from "@/types/openai"
import {Prompt} from "@/types/prompt"
import Chat from "@/components/Chat/Chat"
import {ChatBar} from "@/components/ChatBar/ChatBar"
import PromptBar from "@/components/PromptBar"
import {useUnlock} from "@/components/UnlockCode"
import HomeContext from "./home.context"
import {HomeInitialState, initialState} from "./home.state"
import {Tiktoken} from "js-tiktoken/lite"
import cl100k_base from "js-tiktoken/ranks/cl100k_base"

interface Props {
  serverSideApiKeyIsSet: boolean
  serverSidePluginKeysSet: boolean
  defaultModelId: OpenAIModelID
}

const AUTO_NEW_CONVERSATION_IF_LARGER_THAN_TOKENS = 4000

export const getServerSideProps: GetServerSideProps = async ({locale}) => {
  const defaultModelId =
    (process.env.OPENAI_DEFAULT_MODEL &&
      Object.values(OpenAIModelID).includes(process.env.OPENAI_DEFAULT_MODEL as OpenAIModelID) &&
      process.env.OPENAI_DEFAULT_MODEL) ||
    FALLBACK_OPENAI_MODEL_ID

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
      ...(await serverSideTranslations(locale ?? "en", ["common"]))
    }
  }
}

const Home = ({serverSideApiKeyIsSet, serverSidePluginKeysSet, defaultModelId}: Props) => {
  const {t} = useTranslation("common")
  const {getModels} = useApiService()
  const {getModelsError} = useErrorService()
  const contextValue = useCreateReducer<HomeInitialState>({initialState})
  const router = useRouter()
  const {unlocked} = useUnlock()
  const encoding = new Tiktoken(cl100k_base)

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
        return getModels({apiKey: apiKey}, signal)
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
          folderId: undefined
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
          folderId: undefined
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
    if (
      lastConversation &&
      lastConversation.name === t(NEW_CONVERSATION_TITLE) &&
      lastConversation.messages.length === 0
    ) {
      homeDispatch({field: "selectedConversation", value: lastConversation})
    } else {
      const newConversation = createNewConversation(
        t(NEW_CONVERSATION_TITLE),
        lastConversation?.modelId ?? defaultModelId ?? FALLBACK_OPENAI_MODEL_ID,
        lastConversation?.temperature ?? OPENAI_DEFAULT_TEMPERATURE
      )
      const updatedConversations = [...conversations, newConversation]
      homeDispatch({field: "selectedConversation", value: newConversation})
      homeDispatch({field: "conversations", value: updatedConversations})
      saveSelectedConversation(newConversation)
      saveConversationsHistory(updatedConversations)
    }

    homeDispatch({field: "loading", value: false})
  }

  const handleUpdateConversation = (conversation: Conversation, data: KeyValuePair) => {
    const updatedConversation = {...conversation, [data.key]: data.value}

    const conversationHistory = updateConversationHistory(updatedConversation, conversations)
    homeDispatch({field: "selectedConversation", value: updatedConversation})
    homeDispatch({field: "conversations", value: conversationHistory})
  }

  // EFFECTS  --------------------------------------------

  // Read factory prompts file.
  useEffect(() => {
    console.debug(`useEffect: triggerFactoryPrompts:${triggerFactoryPrompts}`)
    if (triggerFactoryPrompts) {
      const filename = `${router.basePath}/factory-prompts.json`
      console.debug(`useEffect: fetch:${filename}`)
      homeDispatch({field: "triggerFactoryPrompts", value: false})
      fetch(filename)
        .then((response) => response.text())
        .then((text) => {
          let factoryData = JSON.parse(text)
          const validationErrors = isValidJsonData(factoryData)
          if (validationErrors.length === 0) {
            console.debug(`Importing factory prompts file: ${filename}`)
            const {folders, prompts} = importData(factoryData, true)
            homeDispatch({field: "folders", value: folders})
            homeDispatch({field: "prompts", value: prompts})
          } else {
            console.error(`Invalid JSON file; file:${filename}, errors:\n${validationErrors.join("\n")}`)
          }
        })
        .catch((error) => console.error(`Error fetching factory prompts file: ${error}`))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // Re-select the previous conversation. But only if it wasn't too long (to avoid using lost of tokens).
    const selectedConversation = getSelectedConversation()
    if (selectedConversation) {
      const cleanedSelectedConversation = cleanSelectedConversation(selectedConversation)
      homeDispatch({field: "conversations", value: cleanedConversationHistory})
      homeDispatch({field: "selectedConversation", value: cleanedSelectedConversation})
    }

    const allMessages: Message[] = [
      {
        role: "system",
        content: selectedConversation?.prompt ?? ""
      },
      ...(selectedConversation?.messages ?? [])
    ]
    const tokenCount = numberOfTokensInConversation(
      encoding,
      allMessages,
      selectedConversation?.modelId ?? FALLBACK_OPENAI_MODEL_ID
    )
    console.debug(`useEffect: tokenCount:${tokenCount}`)
    if (!selectedConversation || tokenCount >= AUTO_NEW_CONVERSATION_IF_LARGER_THAN_TOKENS) {
      const lastConversation =
        conversationsHistory.length > 0 ? conversationsHistory[conversationsHistory.length - 1] : undefined
      if (lastConversation && lastConversation.messages.length === 0) {
        // If no conversation was selected, select the last conversation if it was empty.
        homeDispatch({field: "conversations", value: cleanedConversationHistory})
        homeDispatch({field: "selectedConversation", value: lastConversation})
      } else {
        // Or create a new empty conversation.
        const newConversation = createNewConversation(
          t(NEW_CONVERSATION_TITLE),
          lastConversation?.modelId ?? defaultModelId ?? FALLBACK_OPENAI_MODEL_ID,
          lastConversation?.temperature ?? OPENAI_DEFAULT_TEMPERATURE
        )
        // Only add a new conversation to the history if there are existing conversations.
        if (cleanedConversationHistory.length > 0) {
          homeDispatch({field: "conversations", value: [...cleanedConversationHistory, newConversation]})
        }
        homeDispatch({field: "selectedConversation", value: newConversation})
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultModelId, serverSideApiKeyIsSet, serverSidePluginKeysSet, homeDispatch])

  // LAYOUT --------------------------------------------

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
        <title>Chatty</title>
        <link rel="apple-touch-icon" sizes="180x180" href={`${router.basePath}/apple-touch-icon.png`} />
        <link rel="icon" type="image/png" sizes="32x32" href={`${router.basePath}/favicon-32x32.png`} />
        <link rel="icon" type="image/png" sizes="16x16" href={`${router.basePath}/favicon-16x16.png`} />
        <link rel="manifest" href={`${router.basePath}/site.webmanifest`} crossOrigin="use-credentials" />
        <link rel="mask-icon" href={`${router.basePath}/safari-pinned-tab.svg`} color="#884444" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="description" content="ChatGPT but better." />
        <meta name="viewport" content="height=device-height ,width=device-width, initial-scale=1, user-scalable=no" />
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

export default Home
