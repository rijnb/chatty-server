import {useHomeContext} from "@/pages/api/home/home.context"
import {Conversation} from "@/types/chat"
import {FolderType} from "@/types/folder"
import {Prompt} from "@/types/prompt"
import {saveConversationsHistory} from "@/utils/app/conversations"
import {createNewFolder, saveFolders} from "@/utils/app/folders"
import {savePrompts} from "@/utils/app/prompts"

const useFoldersOperations = () => {
  const {
    state: {conversations, prompts, folders},
    dispatch: homeDispatch
  } = useHomeContext()

  const createFolder = (name: string, type: FolderType) => {
    const updatedFolders = [...folders, createNewFolder(name, type)]

    homeDispatch({field: "folders", value: updatedFolders})
    saveFolders(updatedFolders)
  }

  const updateFolder = (folderId: string, name: string) => {
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

  const deleteFolder = (folderId: string) => {
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

  return {
    folders,
    createFolder,
    updateFolder,
    deleteFolder
  }
}

export default useFoldersOperations
