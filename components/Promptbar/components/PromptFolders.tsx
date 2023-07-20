import Folder from "@/components/Folder"
import {PromptComponent} from "@/components/Promptbar/components/Prompt"
import HomeContext from "@/pages/api/home/home.context"
import {FolderInterface} from "@/types/folder"
import {useContext} from "react"
import PromptbarContext from "../PromptBar.context"

export const PromptFolders = () => {
  const {
    state: {folders}
  } = useContext(HomeContext)

  const {
    state: {searchTerm, filteredPrompts},
    handleUpdatePrompt
  } = useContext(PromptbarContext)

  const handleDrop = (e: any, folder: FolderInterface) => {
    if (e.dataTransfer) {
      const prompt = JSON.parse(e.dataTransfer.getData("prompt"))

      const updatedPrompt = {
        ...prompt,
        folderId: folder.id
      }

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
                <PromptComponent key={index} prompt={prompt}/>
              </div>
          )
        }
      })

  return (
      <div className="flex w-full flex-col pt-2">
        {folders
        .filter((folder) => folder.type === "prompt")
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((folder, index) => (
            <Folder
                key={index}
                searchTerm={searchTerm}
                currentFolder={folder}
                handleDrop={handleDrop}
                folderComponent={PromptFolders(folder)}
            />
        ))}
      </div>
  )
}
