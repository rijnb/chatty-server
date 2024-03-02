import {v4 as uuidv4} from "uuid"

import useFoldersOperations from "@/components/Folder/useFoldersOperations"
import {useHomeContext} from "@/pages/api/home/home.context"
import {SupportedFileFormats} from "@/types/import"
import {Prompt} from "@/types/prompt"
import {exportData} from "@/utils/app/export"
import {saveFolders} from "@/utils/app/folders"
import {importData} from "@/utils/app/import"
import {createNewPrompt, removePrompts, savePrompts} from "@/utils/app/prompts"

const usePromptsOperations = () => {
  const {
    state: {prompts, triggerSelectedPrompt, defaultModelId},
    dispatch: homeDispatch
  } = useHomeContext()

  const {folders} = useFoldersOperations()

  const selectPrompt = (prompt: Prompt | undefined) => {
    homeDispatch({field: "triggerSelectedPrompt", value: prompt})
  }

  const createPrompt = () => {
    if (defaultModelId) {
      const nrFactoryPrompts = prompts.filter((p) => p.factory).length
      const updatedPrompts = [...prompts, createNewPrompt(`Prompt ${prompts.length - nrFactoryPrompts + 1}`)]
      homeDispatch({field: "prompts", value: updatedPrompts})
      savePrompts(updatedPrompts)
    }
  }

  const updatePrompt = (prompt: Prompt) => {
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
      updatedPrompts = [...prompts, {...prompt, id: uuidv4(), factory: undefined, folderId: undefined}]
    } else {
      updatedPrompts = prompts.map((p) => (p.id === prompt.id ? prompt : p))
    }
    homeDispatch({field: "prompts", value: updatedPrompts})
    savePrompts(updatedPrompts)
  }

  const deletePrompt = (prompt: Prompt) => {
    const updatedPrompts = prompts.filter((p) => p.id !== prompt.id)

    homeDispatch({field: "prompts", value: updatedPrompts})
    savePrompts(updatedPrompts)
  }

  const clearPrompts = () => {
    removePrompts()
    const updatedFolders = folders.filter((f) => f.type !== "prompt")
    saveFolders(updatedFolders)
    homeDispatch({field: "prompts", value: []})
    homeDispatch({field: "folders", value: updatedFolders})
    homeDispatch({field: "triggerFactoryPrompts", value: true})
  }

  const importPrompts = (data: SupportedFileFormats) => {
    const {folders, prompts} = importData(data)
    homeDispatch({field: "folders", value: folders})
    homeDispatch({field: "prompts", value: prompts})
  }

  const exportPrompts = () => {
    exportData("prompts", "prompt")
  }

  return {
    prompts,
    triggerSelectedPrompt,
    selectPrompt,
    createPrompt,
    updatePrompt,
    deletePrompt,
    clearPrompts,
    importPrompts,
    exportPrompts
  }
}

export default usePromptsOperations
