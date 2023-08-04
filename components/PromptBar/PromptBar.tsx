import {useContext, useEffect} from "react"
import {useTranslation} from "react-i18next"
import {useCreateReducer} from "@/hooks/useCreateReducer"
import {exportData} from "@/utils/app/export"
import {saveFolders} from "@/utils/app/folders"
import {importJsonData} from "@/utils/app/import"
import {createNewPrompt, removePrompts, savePrompts} from "@/utils/app/prompts"
import {saveShowPromptBar} from "@/utils/app/settings"
import {LatestFileFormat, SupportedFileFormats} from "@/types/export"
import {OpenAIModels} from "@/types/openai"
import {Prompt} from "@/types/prompt"
import HomeContext from "@/pages/api/home/home.context"
import PromptBarSettings from "./components/PromptBarSettings"
import PromptFolderList from "./components/PromptFolderList"
import PromptList from "./components/PromptList"
import Sidebar from "../Sidebar"
import PromptBarContext from "./PromptBar.context"
import {PromptBarInitialState, initialState} from "./PromptBar.state"
import { v4 as uuidv4 } from "uuid";


const PromptBar = () => {
  const {t} = useTranslation("promptbar")
  const promptBarContextValue = useCreateReducer<PromptBarInitialState>({initialState})

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
    saveShowPromptBar(!showPromptBar)
  }

  const handleCreatePrompt = () => {
    if (defaultModelId) {
      const updatedPrompts = [...prompts, createNewPrompt(`Prompt ${prompts.length + 1}`, OpenAIModels[defaultModelId])]
      homeDispatch({field: "prompts", value: updatedPrompts})
      savePrompts(updatedPrompts)
    }
  }

  const handleClearPrompts = () => {
    removePrompts()
    const updatedFolders = folders.filter((f) => f.type !== "prompt")
    saveFolders(updatedFolders)
    homeDispatch({field: "prompts", value: []})
    homeDispatch({field: "folders", value: updatedFolders})
    homeDispatch({field: "triggerFactoryPrompts", value: true})
  }

  const handleDeletePrompt = (prompt: Prompt) => {
    const updatedPrompts = prompts.filter((p) => p.id !== prompt.id)

    homeDispatch({field: "prompts", value: updatedPrompts})
    savePrompts(updatedPrompts)
  }

  const handleUpdatePrompt = (prompt: Prompt) => {
    // Trim spaces from all input fields.
    prompt.name = prompt.name.trim()
    prompt.description = prompt.description.trim()
    prompt.content = prompt.content.trim()

    // Don't update if the content was unchanged.
    let changed = true
    const previousPrompts = prompts.filter((p) => p.id === prompt.id)
    if (previousPrompts.length > 0) {
      const previousPrompt = previousPrompts[0]
      changed =
        previousPrompt.name !== prompt.name ||
        previousPrompt.description !== prompt.description ||
        previousPrompt.content !== prompt.content
    }

    // Prompt changed, create user prompt from factory prompt if needed.
    let updatedPrompts
    if (prompt.factory && changed) {
      // A changed factory prompt needs to get a new id and be moved outside the factory folder.
      updatedPrompts = [...prompts, {...prompt, id: uuidv4(), factory: null, folderId: null}]
    } else {
      updatedPrompts = prompts.map((p) => (p.id === prompt.id ? prompt : p))
    }
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

  const handleImportPrompts = (data: SupportedFileFormats) => {
    const {folders, prompts}: LatestFileFormat = importJsonData(data)
    homeDispatch({field: "folders", value: folders})
    homeDispatch({field: "prompts", value: prompts})
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
        listItem={<PromptList prompts={filteredPrompts.filter((prompt) => !prompt.folderId)} />}
        folderListItem={<PromptFolderList />}
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