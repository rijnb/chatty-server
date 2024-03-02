import {useEffect} from "react"
import {useTranslation} from "react-i18next"

import Sidebar from "../Sidebar"
import PromptBarContext from "./PromptBar.context"
import {PromptBarInitialState, initialState} from "./PromptBar.state"
import PromptBarSettings from "./components/PromptBarSettings"
import PromptFolderList from "./components/PromptFolderList"
import PromptList from "./components/PromptList"
import useFoldersOperations from "@/components/Folder/useFoldersOperations"
import usePromptsOperations from "@/components/PromptBar/usePromptsOperations"
import {useCreateReducer} from "@/hooks/useCreateReducer"
import {useHomeContext} from "@/pages/api/home/home.context"
import {Prompt} from "@/types/prompt"
import {saveShowPromptBar} from "@/utils/app/settings"

const PromptBar = () => {
  const {t} = useTranslation("common")
  const promptBarContextValue = useCreateReducer<PromptBarInitialState>({initialState})

  const {
    state: {showPromptBar},
    dispatch: homeDispatch
  } = useHomeContext()

  const {createFolder} = useFoldersOperations()
  const {prompts, createPrompt, updatePrompt} = usePromptsOperations()

  const {
    state: {searchTerm, filteredPrompts},
    dispatch: promptDispatch
  } = promptBarContextValue

  const handleTogglePromptBar = () => {
    homeDispatch({field: "showPromptBar", value: !showPromptBar})
    saveShowPromptBar(!showPromptBar)
  }

  const handleDrop = (e: any) => {
    if (e.dataTransfer) {
      const data = e.dataTransfer.getData("prompt")
      if (data) {
        const prompt = JSON.parse(e.dataTransfer.getData("prompt"))
        updatePrompt({...prompt, folderId: e.target.dataset.folderId})
      }
      promptDispatch({field: "searchTerm", value: ""})
      e.target.style.background = "none"
    }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, prompts])

  return (
    <PromptBarContext.Provider
      value={{
        ...promptBarContextValue
      }}
    >
      <Sidebar<Prompt>
        side={"right"}
        isOpen={showPromptBar}
        addItemButtonTitle={t("Prompt")}
        listItem={<PromptList prompts={filteredPrompts.filter((prompt) => !prompt.folderId)} />}
        folderListItem={<PromptFolderList />}
        items={filteredPrompts}
        searchTerm={searchTerm}
        handleSearchTerm={(searchTerm: string) => promptDispatch({field: "searchTerm", value: searchTerm})}
        toggleOpen={handleTogglePromptBar}
        handleCreateItem={createPrompt}
        handleCreateFolder={() => createFolder(t("New folder"), "prompt")}
        handleDrop={handleDrop}
        footerComponent={<PromptBarSettings />}
      />
    </PromptBarContext.Provider>
  )
}

export default PromptBar
