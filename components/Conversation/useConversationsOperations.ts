import {useTranslation} from "next-i18next"

import {useHomeContext} from "@/pages/api/home/home.context"
import {Conversation} from "@/types/chat"
import {KeyValuePair} from "@/types/data"
import {SupportedFileFormats} from "@/types/import"
import {NEW_CONVERSATION_TITLE, OPENAI_DEFAULT_MODEL, OPENAI_DEFAULT_TEMPERATURE} from "@/utils/app/const"
import {
  createNewConversation,
  removeConversationsHistory,
  removeSelectedConversation,
  saveConversationsHistory,
  saveSelectedConversation,
  updateConversationHistory
} from "@/utils/app/conversations"
import {exportData} from "@/utils/app/export"
import {saveFolders} from "@/utils/app/folders"
import {importData} from "@/utils/app/import"

const useConversationsOperations = () => {
  const {t} = useTranslation("common")

  const {
    state: {selectedConversation, conversations, defaultModelId, reuseModel, folders},
    dispatch: homeDispatch
  } = useHomeContext()

  const createConversation = () => {
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
        reuseModel ? lastConversation?.modelId ?? defaultModelId : defaultModelId,
        lastConversation?.temperature ?? OPENAI_DEFAULT_TEMPERATURE,
        lastConversation?.selectedTools ?? []
      )
      const updatedConversations = [...conversations, newConversation]
      homeDispatch({field: "selectedConversation", value: newConversation})
      homeDispatch({field: "conversations", value: updatedConversations})
      saveSelectedConversation(newConversation)
      saveConversationsHistory(updatedConversations)
    }

    homeDispatch({field: "loading", value: false})
  }

  const selectConversation = (conversation: Conversation) => {
    homeDispatch({
      field: "selectedConversation",
      value: conversation
    })
    saveSelectedConversation(conversation)
  }

  const updateConversation = (conversation: Conversation, ...data: KeyValuePair[]) => {
    const updatedConversation = data.reduce((acc, curr) => {
      return {...acc, [curr.key]: curr.value}
    }, conversation)

    if (updatedConversation.id === selectedConversation?.id) {
      selectConversation(updatedConversation)
    }

    const conversationHistory = updateConversationHistory(conversations, updatedConversation)
    homeDispatch({field: "conversations", value: conversationHistory})
  }

  const deleteConversation = (conversation: Conversation) => {
    const updatedConversations = conversations.filter((c) => c.id !== conversation.id)

    homeDispatch({field: "conversations", value: updatedConversations})
    saveConversationsHistory(updatedConversations)

    if (updatedConversations.length > 0) {
      selectConversation(updatedConversations[updatedConversations.length - 1])
    } else {
      removeSelectedConversation()
      defaultModelId &&
        homeDispatch({
          field: "selectedConversation",
          value: createNewConversation(
            t(NEW_CONVERSATION_TITLE),
            defaultModelId || OPENAI_DEFAULT_MODEL,
            OPENAI_DEFAULT_TEMPERATURE,
            []
          )
        })
    }
  }

  const clearConversations = () => {
    removeConversationsHistory()
    removeSelectedConversation()
    const updatedFolders = folders.filter((f) => f.type !== "chat")
    if (defaultModelId) {
      const newConversation = createNewConversation(
        t(NEW_CONVERSATION_TITLE),
        defaultModelId || OPENAI_DEFAULT_MODEL,
        OPENAI_DEFAULT_TEMPERATURE,
        []
      )
      selectConversation(newConversation)
    }
    homeDispatch({field: "conversations", value: []})
    homeDispatch({field: "folders", value: updatedFolders})
    saveFolders(updatedFolders)
  }

  const importConversations = (data: SupportedFileFormats) => {
    const {history, folders} = importData(data)
    homeDispatch({field: "conversations", value: history})
    homeDispatch({
      field: "selectedConversation",
      value:
        history.length > 0
          ? history[history.length - 1]
          : createNewConversation(
              t(NEW_CONVERSATION_TITLE),
              defaultModelId || OPENAI_DEFAULT_MODEL,
              OPENAI_DEFAULT_TEMPERATURE,
              []
            )
    })
    homeDispatch({field: "folders", value: folders})
  }

  const exportConversations = () => {
    exportData("conversations", "chat")
  }

  return {
    selectedConversation,
    conversations,
    createConversation,
    selectConversation,
    updateConversation,
    deleteConversation,
    clearConversations,
    importConversations,
    exportConversations
  }
}

export default useConversationsOperations
