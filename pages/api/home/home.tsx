/*
 * Copyright (C) 2024, Rijn Buve.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions
 * of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import {GetServerSideProps} from "next"
import {useTranslation} from "next-i18next"
import {serverSideTranslations} from "next-i18next/serverSideTranslations"
import Head from "next/head"
import {useRouter} from "next/router"
import {useEffect, useRef} from "react"
import {useQuery} from "react-query"

import HomeContext from "./home.context"
import {HomeInitialState, initialState} from "./home.state"
import Chat from "@/components/Chat/Chat"
import {ChatBar} from "@/components/ChatBar/ChatBar"
import PromptBar from "@/components/PromptBar"
import {useUnlock} from "@/components/UnlockCode"
import {useCreateReducer} from "@/hooks/useCreateReducer"
import useErrorService from "@/services/errorService"
import useApiService from "@/services/useApiService"
import {Conversation, Message} from "@/types/chat"
import {KeyValuePair} from "@/types/data"
import {FolderType} from "@/types/folder"
import {FALLBACK_OPENAI_MODEL, OpenAIModels} from "@/types/openai"
import {Prompt} from "@/types/prompt"
import {cleanConversationHistory, cleanSelectedConversation} from "@/utils/app/clean"
import {
  NEW_CONVERSATION_TITLE,
  OPENAI_ALLOW_MODEL_SELECTION,
  OPENAI_DEFAULT_REASONING_EFFORT,
  OPENAI_DEFAULT_TEMPERATURE,
  OPENAI_REUSE_MODEL
} from "@/utils/app/const"
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
import {TiktokenEncoder} from "@/utils/server/tiktoken"

interface Props {
  serverSideApiKeyIsSet: boolean
  serverSidePluginKeysSet: boolean
  defaultModelId: string
  reuseModel: boolean
  allowModelSelection: boolean
}

const AUTO_NEW_CONVERSATION_IF_LARGER_THAN_TOKENS = 500

export const getServerSideProps: GetServerSideProps = async ({locale}) => {
  const googleApiKey = process.env.GOOGLE_API_KEY
  const googleCSEId = process.env.GOOGLE_CSE_ID
  const serverSideApiKeyIsSet = !!process.env.OPENAI_API_KEY
  const serverSidePluginKeysSet = !!(googleApiKey && googleCSEId)
  const defaultModelId = OpenAIModels.hasOwnProperty(process.env.OPENAI_DEFAULT_MODEL || "")
    ? process.env.OPENAI_DEFAULT_MODEL
    : FALLBACK_OPENAI_MODEL
  const reuseModel = OPENAI_REUSE_MODEL
  const allowModelSelection = OPENAI_ALLOW_MODEL_SELECTION
  console.log(
    `getServerSideProps: defaultModelId:${defaultModelId}, reuseModel:${reuseModel}, allowModelSelection:${allowModelSelection}`
  )
  return {
    props: {
      serverSideApiKeyIsSet: serverSideApiKeyIsSet,
      serverSidePluginKeysSet: serverSidePluginKeysSet,
      defaultModelId: defaultModelId,
      reuseModel: reuseModel,
      allowModelSelection: allowModelSelection,
      ...(await serverSideTranslations(locale ?? "en", ["common"]))
    }
  }
}

const Home = ({
  serverSideApiKeyIsSet,
  serverSidePluginKeysSet,
  defaultModelId,
  reuseModel,
  allowModelSelection
}: Props) => {
  const {t} = useTranslation("common")
  const {getModels} = useApiService()
  const {getModelsError} = useErrorService()
  const contextValue = useCreateReducer<HomeInitialState>({initialState})
  const router = useRouter()
  const {unlocked} = useUnlock()

  const {
    state: {apiKey, models, folders, conversations, selectedConversation, prompts, triggerFactoryPrompts},
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
    const newConversation = cleanSelectedConversation(conversation, models, defaultModelId, allowModelSelection)
    homeDispatch({
      field: "selectedConversation",
      value: newConversation
    })
    saveSelectedConversation(newConversation)
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
      console.debug(`handleNewConversation: reuseModel:${reuseModel}, model:${defaultModelId}`)
      const newConversation = createNewConversation(
        t(NEW_CONVERSATION_TITLE),
        allowModelSelection
          ? reuseModel
            ? (lastConversation?.modelId ?? defaultModelId)
            : defaultModelId
          : defaultModelId,
        lastConversation?.temperature ?? OPENAI_DEFAULT_TEMPERATURE,
        lastConversation?.reasoningEffort ?? OPENAI_DEFAULT_REASONING_EFFORT
      )
      const updatedConversations = [...conversations, newConversation]
      homeDispatch({field: "selectedConversation", value: newConversation})
      homeDispatch({field: "conversations", value: updatedConversations})
      saveSelectedConversation(newConversation)
      saveConversationsHistory(updatedConversations)
    }

    homeDispatch({field: "loading", value: false})
  }

  const handleUpdateConversation = (conversation: Conversation, data: KeyValuePair[]) => {
    const updatedConversation = data.reduce((acc, curr) => {
      return {...acc, [curr.key]: curr.value}
    }, conversation)

    const conversationHistory = updateConversationHistory(conversations, updatedConversation)
    homeDispatch({field: "selectedConversation", value: updatedConversation})
    homeDispatch({field: "conversations", value: conversationHistory})
  }

  const loadPromptsFromFile = (filename: string) => {
    console.debug(`loadPromptsFromFile: ${filename}`)
    fetch(filename)
      .then((response) => response.text())
      .then((text) => {
        let factoryData = JSON.parse(text)
        const validationErrors = isValidJsonData(factoryData)
        if (validationErrors.length === 0) {
          console.debug(`Importing prompts file: ${filename}`)
          const {folders, prompts} = importData(factoryData, true)
          homeDispatch({field: "folders", value: folders})
          homeDispatch({field: "prompts", value: prompts})
        } else {
          console.error(`Invalid JSON file; file:${filename}, errors:\n${validationErrors.join("\n")}`)
        }
      })
      .catch((error) => console.error(`Error fetching prompts file: ${error}`))
  }

  // EFFECTS  --------------------------------------------

  // Read factory prompts file.
  useEffect(() => {
    console.debug(`useEffect: triggerFactoryPrompts:${triggerFactoryPrompts}`)
    if (triggerFactoryPrompts) {
      homeDispatch({field: "triggerFactoryPrompts", value: false})

      // Remove factory prompts and folders.
      const nonFactoryPrompts = getPrompts().filter((prompt) => !prompt.factory)
      savePrompts(nonFactoryPrompts)
      const nonFactoryFolders = getFolders().filter((folder) => !folder.factory)
      saveFolders(nonFactoryFolders)

      loadPromptsFromFile(`${router.basePath}/factory-prompts.json`)
      loadPromptsFromFile(`${router.basePath}/factory-prompts-local.json`)
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

  // If models changed, make sure the selected conversation has an existing model ID.
  useEffect(() => {
    console.debug(`useEffect: models:"${models.map((m) => m.id).join(";")}"`)
    if (models?.length > 0) {
      const selectedConversation = getSelectedConversation()
      if (selectedConversation) {
        const cleanedSelectedConversation = cleanSelectedConversation(
          selectedConversation,
          models,
          defaultModelId,
          allowModelSelection
        )
        homeDispatch({field: "selectedConversation", value: cleanedSelectedConversation})
      } else {
        console.debug(`useEffect: no selected conversation`)
      }
    }
  }, [allowModelSelection, models, defaultModelId, homeDispatch])

  // Server side props changed.
  useEffect(() => {
    apiKey && homeDispatch({field: "apiKey", value: apiKey})
  }, [apiKey, homeDispatch])

  // Load settings from local storage.
  useEffect(() => {
    console.debug("useEffect: server-side props changed")
    const apiKey = getApiKey()

    console.debug(`useEffect: serverSideApiKeyIsSet:${serverSideApiKeyIsSet}`)
    serverSideApiKeyIsSet &&
      homeDispatch({
        field: "serverSideApiKeyIsSet",
        value: serverSideApiKeyIsSet
      })
    console.debug(`useEffect: serverSidePluginKeySet:${serverSidePluginKeysSet}`)
    serverSidePluginKeysSet &&
      homeDispatch({
        field: "serverSidePluginKeysSet",
        value: serverSidePluginKeysSet
      })
    console.debug(`useEffect: defaultModelId:${defaultModelId}`)
    defaultModelId &&
      homeDispatch({
        field: "defaultModelId",
        value: defaultModelId
      })
    console.debug(`useEffect: reuseModel:${reuseModel}`)
    homeDispatch({
      field: "reuseModel",
      value: reuseModel
    })
    console.debug(`useEffect: allowModelSelection:${allowModelSelection}`)
    homeDispatch({
      field: "allowModelSelection",
      value: allowModelSelection
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
    const cleanedConversationHistory = cleanConversationHistory(conversationsHistory, defaultModelId)

    // Re-select the previous conversation. But only if it wasn't too long (to avoid using lost of tokens).
    const reselectPreviousConversation = async () => {
      const selectedConversation = getSelectedConversation()
      if (selectedConversation) {
        const cleanedSelectedConversation = cleanSelectedConversation(
          selectedConversation,
          models,
          defaultModelId,
          allowModelSelection
        )
        homeDispatch({field: "selectedConversation", value: cleanedSelectedConversation})
        homeDispatch({field: "conversations", value: cleanedConversationHistory})
      }

      let tokenCount = 0
      if (selectedConversation) {
        const allMessages: Message[] = [
          {
            role: "system",
            content: selectedConversation?.prompt ?? ""
          },
          ...(selectedConversation?.messages ?? [])
        ]

        const encoder = await TiktokenEncoder.create()

        tokenCount = encoder.numberOfTokensInConversation(allMessages, selectedConversation?.modelId ?? defaultModelId)
      }

      console.debug(`useEffect: tokenCount:${tokenCount}`)
      if (!selectedConversation || tokenCount >= AUTO_NEW_CONVERSATION_IF_LARGER_THAN_TOKENS) {
        const lastConversation =
          conversationsHistory.length > 0 ? conversationsHistory[conversationsHistory.length - 1] : undefined
        if (
          lastConversation &&
          lastConversation.messages.length === 0 &&
          tokenCount < AUTO_NEW_CONVERSATION_IF_LARGER_THAN_TOKENS
        ) {
          // If no conversation was selected, select the last conversation if it was empty.
          homeDispatch({field: "conversations", value: cleanedConversationHistory})
          homeDispatch({field: "selectedConversation", value: lastConversation})
        } else {
          // Or create a new empty conversation.
          const newConversation = createNewConversation(
            t(NEW_CONVERSATION_TITLE),
            allowModelSelection
              ? reuseModel
                ? (lastConversation?.modelId ?? defaultModelId)
                : defaultModelId
              : defaultModelId,
            lastConversation?.temperature ?? OPENAI_DEFAULT_TEMPERATURE,
            lastConversation?.reasoningEffort ?? OPENAI_DEFAULT_REASONING_EFFORT
          )
          // Only add a new conversation to the history if there are existing conversations.
          if (cleanedConversationHistory.length > 0) {
            homeDispatch({field: "conversations", value: [...cleanedConversationHistory, newConversation]})
          }
          homeDispatch({field: "selectedConversation", value: newConversation})
        }
      }
    }
    reselectPreviousConversation().catch((error) => console.error(`Error reselecting previous conversation: ${error}`))

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultModelId, serverSideApiKeyIsSet, serverSidePluginKeysSet, reuseModel, allowModelSelection, homeDispatch])

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
