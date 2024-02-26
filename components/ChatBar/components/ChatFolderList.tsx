import ConversationListItem from "./ConversationListItem"
import useConversationsOperations from "@/components/Conversation/useConversationsOperations"
import Folder from "@/components/Folder"
import useFoldersOperations from "@/components/Folder/useFoldersOperations"
import {FolderInterface} from "@/types/folder"

interface Props {
  searchTerm: string
}

export const ChatFolderList = ({searchTerm}: Props) => {
  const {selectedConversation, conversations, updateConversation} = useConversationsOperations()
  const {folders} = useFoldersOperations()

  const handleDrop = (e: any, folder: FolderInterface) => {
    if (e.dataTransfer) {
      const data = e.dataTransfer.getData("conversation")
      if (data) {
        const conversation = JSON.parse(data)
        updateConversation(conversation, {key: "folderId", value: folder.id})
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
