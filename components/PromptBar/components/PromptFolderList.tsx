import {useContext} from "react"

import PromptBarContext from "../PromptBar.context"
import usePromptsOperations from "../usePromptsOperations"
import Folder from "@/components/Folder"
import useFoldersOperations from "@/components/Folder/useFoldersOperations"
import PromptListItem from "@/components/PromptBar/components/PromptListItem"
import {FolderInterface} from "@/types/folder"

interface Props {}

export const PromptFolderList = ({}: Props) => {
  const {folders} = useFoldersOperations()
  const {updatePrompt} = usePromptsOperations()

  const {
    state: {searchTerm, filteredPrompts}
  } = useContext(PromptBarContext)

  const handleDrop = (e: any, folder: FolderInterface) => {
    if (e.dataTransfer) {
      const data = e.dataTransfer.getData("prompt")
      if (data) {
        const prompt = JSON.parse(data)
        updatePrompt({...prompt, folderId: folder.id})
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
