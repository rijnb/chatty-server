import {useContext} from "react"
import {FolderInterface} from "@/types/folder"
import HomeContext from "@/pages/api/home/home.context"
import Folder from "@/components/Folder"
import ConversationListItem from "./ConversationListItem"


interface Props {
  searchTerm: string
}

export const ChatFolderList = ({searchTerm}: Props) => {
  const {
    state: {folders, conversations, selectedConversation},
    handleUpdateConversation
  } = useContext(HomeContext)

  const handleDrop = (e: any, folder: FolderInterface) => {
    if (e.dataTransfer) {
      const data = e.dataTransfer.getData("conversation")
      if (data) {
        const conversation = JSON.parse(data)
        handleUpdateConversation(conversation, [{key: "folderId", value: folder.id}])
      }
    }
  }

  const ChatFolders = (currentFolder: FolderInterface) => {
    return (
      conversations &&
      conversations
        .filter((conversation) => conversation.folderId)
        .map((conversation, index) => {
          if (conversation.folderId === currentFolder.id) {
            return (
              <div key={index} className="ml-5 gap-2 border-l pl-2">
                <ConversationListItem
                  conversation={conversation}
                  isSelected={conversation.id == selectedConversation?.id}
                />
              </div>
            )
          }
        })
    )
  }

  return (
    <div className="flex w-full flex-col pt-2">
      {folders
        .filter((folder) => folder.type === "chat")
        .sort((a, b) => a.name.localeCompare(b.name))
        .sort((a, b) => (a.factory === b.factory ? 0 : a.factory ? 1 : -1))
        .map((folder, index) => (
          <Folder
            key={index}
            searchTerm={searchTerm}
            folder={folder}
            allowDrop={!folder.factory}
            handleDrop={handleDrop}
            folderComponent={ChatFolders(folder)}
          />
        ))}
    </div>
  )
}

export default ChatFolderList