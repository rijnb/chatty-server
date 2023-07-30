import {useContext, useEffect} from "react"
import {useTranslation} from "react-i18next"
import {useCreateReducer} from "@/hooks/useCreateReducer"
import {exportData} from "@/utils/app/export"
import {saveFolders} from "@/utils/app/folders"
import {importData} from "@/utils/app/import"
import {createNewPrompt, savePrompts, STORAGE_KEY_PROMPTS} from "@/utils/app/prompts"
import {LatestExportFormat, SupportedExportFormats} from "@/types/export"
import {OpenAIModels} from "@/types/openai"
import {Prompt} from "@/types/prompt"
import HomeContext from "@/pages/api/home/home.context"
import {PromptBarSettings} from "./components/PromptBarSettings"
import {PromptFolders} from "./components/PromptFolders"
import {Prompts} from "./components/Prompts"
import Sidebar from "../Sidebar"
import PromptBarContext from "./PromptBar.context"
import {PromptBarInitialState, initialState} from "./PromptBar.state"


const PromptBar = () => {
  const {t} = useTranslation("promptbar")

  const promptBarContextValue = useCreateReducer<PromptBarInitialState>({
    initialState
  })

  const {
    state: {prompts, defaultModelId, showPromptBar, folders},
    dispatch: homeDispatch,
    handleCreateFolder
  } = useContext(HomeContext)

  const {
    state: {searchTerm, filteredPrompts},
    dispatch: promptDispatch
  } = promptBarContextValue

  const handleTogglePromptBar = () => {
    homeDispatch({field: "showPromptBar", value: !showPromptBar})
    localStorage.setItem("showPromptBar", JSON.stringify(!showPromptBar))
  }

  const handleCreatePrompt = () => {
    if (defaultModelId) {
      const updatedPrompts = [...prompts, createNewPrompt(`Prompt ${prompts.length + 1}`, OpenAIModels[defaultModelId])]
      homeDispatch({field: "prompts", value: updatedPrompts})
      savePrompts(updatedPrompts)
    }
  }

  const handleClearPrompts = () => {
    homeDispatch({field: "prompts", value: []})
    localStorage.removeItem(STORAGE_KEY_PROMPTS)
    const updatedFolders = folders.filter((f) => f.type !== "prompt")
    homeDispatch({field: "folders", value: updatedFolders})
    saveFolders(updatedFolders)
  }

  const handleDeletePrompt = (prompt: Prompt) => {
    const updatedPrompts = prompts.filter((p) => p.id !== prompt.id)

    homeDispatch({field: "prompts", value: updatedPrompts})
    savePrompts(updatedPrompts)
  }

  const handleUpdatePrompt = (prompt: Prompt) => {
    const updatedPrompts = prompts.map((p) => {
      if (p.id === prompt.id) {
        return prompt
      }

      return p
    })
    homeDispatch({field: "prompts", value: updatedPrompts})
    savePrompts(updatedPrompts)
  }

  const handleDrop = (e: any) => {
    if (e.dataTransfer) {
      const prompt = JSON.parse(e.dataTransfer.getData("prompt"))

      const updatedPrompt = {
        ...prompt,
        folderId: e.target.dataset.folderId
      }

      handleUpdatePrompt(updatedPrompt)
      e.target.style.background = "none"
    }
  }

  const handleImportPrompts = (data: SupportedExportFormats) => {
    const {folders, prompts}: LatestExportFormat = importData(data)
    homeDispatch({field: "folders", value: folders})
    homeDispatch({field: "prompts", value: prompts})
    window.location.reload()
  }

  const handleExportPrompts = () => {
    exportData("prompts", "prompt")
  }

  useEffect(() => {
    if (searchTerm) {
      promptDispatch({
        field: "filteredPrompts",
        value: prompts.filter((prompt) => {
          const searchable =
            prompt.name.toLowerCase() + " " + prompt.description.toLowerCase() + " " + prompt.content.toLowerCase()
          return searchable.includes(searchTerm.toLowerCase())
        })
      })
    } else {
      promptDispatch({field: "filteredPrompts", value: prompts})
    }
  }, [searchTerm, prompts])

  return (
    <PromptBarContext.Provider
      value={{
        ...promptBarContextValue,
        handleCreatePrompt,
        handleDeletePrompt,
        handleUpdatePrompt,
        handleClearPrompts,
        handleImportPrompts,
        handleExportPrompts
      }}
    >
      <Sidebar<Prompt>
        side={"right"}
        isOpen={showPromptBar}
        addItemButtonTitle={t("New prompt")}
        itemComponent={<Prompts prompts={filteredPrompts.filter((prompt) => !prompt.folderId)} />}
        folderComponent={<PromptFolders />}
        items={filteredPrompts}
        searchTerm={searchTerm}
        handleSearchTerm={(searchTerm: string) => promptDispatch({field: "searchTerm", value: searchTerm})}
        toggleOpen={handleTogglePromptBar}
        handleCreateItem={handleCreatePrompt}
        handleCreateFolder={() => handleCreateFolder(t("New folder"), "prompt")}
        handleDrop={handleDrop}
        footerComponent={<PromptBarSettings />}
      />
    </PromptBarContext.Provider>
  )
}

export default PromptBar