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

import {useContext} from "react"

import ConversationListItem from "./ConversationListItem"
import Folder from "@/components/Folder"
import HomeContext from "@/pages/api/home/home.context"
import {FolderInterface} from "@/types/folder"

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
