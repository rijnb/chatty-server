import {useCallback, useContext, useEffect} from "react"

import {useTranslation} from "next-i18next"

import {useCreateReducer} from "@/hooks/useCreateReducer"

import {OPENAI_DEFAULT_SYSTEM_PROMPT, OPENAI_DEFAULT_TEMPERATURE} from "@/utils/app/const"
import {saveConversationsHistory, saveSelectedConversation} from "@/utils/app/conversations"
import {exportData} from "@/utils/app/export"
import {saveFolders} from "@/utils/app/folders"
import {importData} from "@/utils/app/import"

import {Conversation} from "@/types/chat"
import {LatestExportFormat, SupportedExportFormats} from "@/types/export"
import {OpenAIModels} from "@/types/openai"
import {PluginKey} from "@/types/plugin"

import HomeContext from "@/pages/api/home/home.context"

import {ChatBarSettings} from "./components/ChatBarSettings"
import {ChatFolders} from "./components/ChatFolders"
import {Conversations} from "./components/Conversations"

import Sidebar from "../Sidebar"
import ChatBarContext from "./ChatBar.context"
import {ChatBarInitialState, initialState} from "./ChatBar.state"



import { v4 as uuidv4 } from "uuid";


export const ChatBar = () => {
  const {t} = useTranslation("sidebar")

  const chatBarContextValue = useCreateReducer<ChatBarInitialState>({
    initialState
  })

  const {
    state: {conversations, showChatBar, defaultModelId, folders, pluginKeys},
    dispatch: homeDispatch,
    handleCreateFolder,
    handleNewConversation,
    handleUpdateConversation
  } = useContext(HomeContext)

  const {
    state: {searchTerm, filteredConversations},
    dispatch: chatDispatch
  } = chatBarContextValue

  const handleUnlockCodeChange = useCallback(
    (unlockCode: string) => {
      homeDispatch({field: "unlockCode", value: unlockCode})

      localStorage.setItem("unlockCode", unlockCode)
    },
    [homeDispatch]
  )

  const handleApiKeyChange = useCallback(
    (apiKey: string) => {
      homeDispatch({field: "apiKey", value: apiKey})

      localStorage.setItem("apiKey", apiKey)
    },
    [homeDispatch]
  )

  const handlePluginKeyChange = (pluginKey: PluginKey) => {
    if (pluginKeys.some((key) => key.pluginId === pluginKey.pluginId)) {
      const updatedPluginKeys = pluginKeys.map((key) => {
        if (key.pluginId === pluginKey.pluginId) {
          return pluginKey
        }

        return key
      })

      homeDispatch({field: "pluginKeys", value: updatedPluginKeys})

      localStorage.setItem("pluginKeys", JSON.stringify(updatedPluginKeys))
    } else {
      homeDispatch({field: "pluginKeys", value: [...pluginKeys, pluginKey]})

      localStorage.setItem("pluginKeys", JSON.stringify([...pluginKeys, pluginKey]))
    }
  }

  const handleClearPluginKey = (pluginKey: PluginKey) => {
    const updatedPluginKeys = pluginKeys.filter((key) => key.pluginId !== pluginKey.pluginId)

    if (updatedPluginKeys.length === 0) {
      homeDispatch({field: "pluginKeys", value: []})
      localStorage.removeItem("pluginKeys")
      return
    }

    homeDispatch({field: "pluginKeys", value: updatedPluginKeys})

    localStorage.setItem("pluginKeys", JSON.stringify(updatedPluginKeys))
  }

  const handleClearConversations = () => {
    defaultModelId &&
      homeDispatch({
        field: "selectedConversation",
        value: {
          id: uuidv4(),
          name: t("New conversation"),
          messages: [],
          model: OpenAIModels[defaultModelId],
          prompt: OPENAI_DEFAULT_SYSTEM_PROMPT,
          temperature: OPENAI_DEFAULT_TEMPERATURE,
          folderId: null,
          time: new Date().getTime()
        }
      })

    homeDispatch({field: "conversations", value: []})
    localStorage.removeItem("conversationHistory")
    localStorage.removeItem("selectedConversation")
    const updatedFolders = folders.filter((f) => f.type !== "chat")
    homeDispatch({field: "folders", value: updatedFolders})
    saveFolders(updatedFolders)
  }

  const handleImportConversations = (data: SupportedExportFormats) => {
    const {history, folders}: LatestExportFormat = importData(data)
    homeDispatch({field: "conversations", value: history})
    homeDispatch({
      field: "selectedConversation",
      value: history[history.length - 1]
    })
    homeDispatch({field: "folders", value: folders})
  }

  const handleExportConversations = () => {
    exportData("conversations", "chat")
  }

  const handleDeleteConversation = (conversation: Conversation) => {
    const updatedConversations = conversations.filter((c) => c.id !== conversation.id)

    homeDispatch({field: "conversations", value: updatedConversations})
    chatDispatch({field: "searchTerm", value: ""})
    saveConversationsHistory(updatedConversations)

    if (updatedConversations.length > 0) {
      homeDispatch({
        field: "selectedConversation",
        value: updatedConversations[updatedConversations.length - 1]
      })

      saveSelectedConversation(updatedConversations[updatedConversations.length - 1])
    } else {
      defaultModelId &&
        homeDispatch({
          field: "selectedConversation",
          value: {
            id: uuidv4(),
            name: t("New conversation"),
            messages: [],
            model: OpenAIModels[defaultModelId],
            prompt: OPENAI_DEFAULT_SYSTEM_PROMPT,
            temperature: OPENAI_DEFAULT_TEMPERATURE,
            folderId: null,
            time: new Date().getTime()
          }
        })

      localStorage.removeItem("selectedConversation")
    }
  }

  const handleToggleChatBar = () => {
    homeDispatch({field: "showChatBar", value: !showChatBar})
    localStorage.setItem("showChatBar", JSON.stringify(!showChatBar))
  }

  const handleDrop = (e: any) => {
    if (e.dataTransfer) {
      const conversation = JSON.parse(e.dataTransfer.getData("conversation"))
      handleUpdateConversation(conversation, {key: "folderId", value: 0})
      chatDispatch({field: "searchTerm", value: ""})
      e.target.style.background = "none"
    }
  }

  useEffect(() => {
    if (searchTerm) {
      chatDispatch({
        field: "filteredConversations",
        value: conversations.filter((conversation) => {
          const searchable =
            conversation.name.toLocaleLowerCase() +
            " " +
            conversation.messages.map((message) => message.content).join(" ")
          return searchable.toLowerCase().includes(searchTerm.toLowerCase())
        })
      })
    } else {
      chatDispatch({
        field: "filteredConversations",
        value: conversations
      })
    }
  }, [searchTerm, conversations])

  return (
    <ChatBarContext.Provider
      value={{
        ...chatBarContextValue,
        handleDeleteConversation,
        handleClearConversations,
        handleImportConversations,
        handleExportConversations,
        handlePluginKeyChange,
        handleClearPluginKey,
        handleApiKeyChange,
        handleUnlockCodeChange: handleUnlockCodeChange
      }}
    >
      <Sidebar<Conversation>
        side={"left"}
        isOpen={showChatBar}
        addItemButtonTitle={t("New conversation")}
        itemComponent={<Conversations conversations={filteredConversations} />}
        folderComponent={<ChatFolders searchTerm={searchTerm} />}
        items={filteredConversations}
        searchTerm={searchTerm}
        handleSearchTerm={(searchTerm: string) => chatDispatch({field: "searchTerm", value: searchTerm})}
        toggleOpen={handleToggleChatBar}
        handleCreateItem={handleNewConversation}
        handleCreateFolder={() => handleCreateFolder(t("New folder"), "chat")}
        handleDrop={handleDrop}
        footerComponent={<ChatBarSettings />}
      />
    </ChatBarContext.Provider>
  )
}