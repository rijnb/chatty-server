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

import PromptBarContext from "../PromptBar.context"
import Folder from "@/components/Folder"
import PromptListItem from "@/components/PromptBar/components/PromptListItem"
import HomeContext from "@/pages/api/home/home.context"
import {FolderInterface} from "@/types/folder"

interface Props {}

export const PromptFolderList = ({}: Props) => {
  const {
    state: {folders}
  } = useContext(HomeContext)

  const {
    state: {searchTerm, filteredPrompts},
    handleUpdatePrompt
  } = useContext(PromptBarContext)

  const handleDrop = (e: any, folder: FolderInterface) => {
    if (e.dataTransfer) {
      const data = e.dataTransfer.getData("prompt")
      if (data) {
        const prompt = JSON.parse(data)
        handleUpdatePrompt({...prompt, folderId: folder.id})
      }
    }
  }

  const PromptFolders = (currentFolder: FolderInterface) =>
    filteredPrompts
      .filter((p) => p.folderId)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((prompt, index) => {
        if (prompt.folderId === currentFolder.id) {
          return (
            <div key={index} className="ml-5 gap-2 border-l pl-2">
              <PromptListItem key={index} prompt={prompt} />
            </div>
          )
        }
      })

  return (
    <div className="flex w-full flex-col pt-2">
      {folders.filter((folder) => folder.type === "prompt" && folder.factory).length > 0 && (
        <span className="list-header-1">Factory prompts:</span>
      )}
      {folders
        .filter((folder) => folder.type === "prompt" && folder.factory)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((folder, index) => (
          <Folder
            key={index}
            searchTerm={searchTerm}
            folder={folder}
            allowDrop={!folder.factory}
            handleDrop={handleDrop}
            folderComponent={PromptFolders(folder)}
          />
        ))}
      {folders.filter((folder) => folder.type === "prompt" && !folder.factory).length > 0 && (
        <span className="list-header-1">User prompts:</span>
      )}
      {folders
        .filter((folder) => folder.type === "prompt" && !folder.factory)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((folder, index) => (
          <Folder
            key={index}
            searchTerm={searchTerm}
            folder={folder}
            allowDrop={!folder.factory}
            handleDrop={handleDrop}
            folderComponent={PromptFolders(folder)}
          />
        ))}
    </div>
  )
}

export default PromptFolderList
