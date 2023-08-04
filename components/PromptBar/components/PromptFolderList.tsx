import {useContext} from "react"
import {FolderInterface} from "@/types/folder"
import HomeContext from "@/pages/api/home/home.context"
import Folder from "@/components/Folder"
import PromptListItem from "@/components/PromptBar/components/PromptListItem"
import PromptBarContext from "../PromptBar.context"


export const PromptFolderList = () => {
  const {
    state: {folders}
  } = useContext(HomeContext)

  const {
    state: {searchTerm, filteredPrompts},
    handleUpdatePrompt
  } = useContext(PromptBarContext)

  const handleDrop = (e: any, folder: FolderInterface) => {
    if (e.dataTransfer) {
      const prompt = JSON.parse(e.dataTransfer.getData("prompt"))
      const updatedPrompt = {...prompt, folderId: folder.id}
      handleUpdatePrompt(updatedPrompt)
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
      {folders
        .filter((folder) => folder.type === "prompt")
        .sort((a, b) => a.name.localeCompare(b.name))
        .sort((a, b) => (a.factory === b.factory ? 0 : a.factory ? 1 : -1))
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