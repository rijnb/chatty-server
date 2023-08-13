import {IconBuildingFactory2, IconCheck, IconTrash, IconUserCircle, IconX} from "@tabler/icons-react"
import {DragEvent, MouseEventHandler, useContext, useState} from "react"
import {Prompt} from "@/types/prompt"
import SidebarActionButton from "@/components/Buttons/SidebarActionButton"
import PromptBarContext from "../PromptBar.context"
import PromptEditModal from "./PromptEditModal"

interface Props {
  prompt: Prompt
}

export const PromptListItem = ({prompt}: Props) => {
  const {dispatch: promptDispatch, handleUpdatePrompt, handleDeletePrompt} = useContext(PromptBarContext)

  const [showModal, setShowModal] = useState<boolean>(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleUpdate = (prompt: Prompt) => {
    setShowModal(false)
    handleUpdatePrompt(prompt)
    promptDispatch({field: "searchTerm", value: ""})
  }

  const handleDelete: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation()
    if (isDeleting) {
      handleDeletePrompt(prompt)
      promptDispatch({field: "searchTerm", value: ""})
    }
    setIsDeleting(false)
  }

  const handleCancelDelete: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation()
    setIsDeleting(false)
  }

  const handleConfirmDelete: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation()
    setIsDeleting(true)
  }

  const handleDragStart = (e: DragEvent<HTMLButtonElement>, prompt: Prompt) => {
    if (e.dataTransfer) {
      e.dataTransfer.setData("prompt", JSON.stringify(prompt))
    }
  }

  return (
    <div className="relative flex items-center">
      <button
        className="flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 text-sm text-gray-800 transition-colors duration-200 hover:bg-gray-300 hover:bg-gray-300 dark:text-white dark:hover:bg-[#343541]/90"
        draggable={prompt.factory ? "false" : "true"}
        onClick={(e) => {
          e.stopPropagation()
          setShowModal(true)
        }}
        onDragStart={(e) => handleDragStart(e, prompt)}
        onMouseLeave={() => {
          setIsDeleting(false)
        }}
      >
        {prompt.factory ? (
          <IconBuildingFactory2 size={18} className="text-gray-500 dark:text-neutral-300" />
        ) : (
          <IconUserCircle size={18} className="text-gray-500 dark:text-neutral-300" />
        )}
        <div className="relative max-h-5 flex-1 overflow-hidden text-ellipsis whitespace-nowrap break-all pr-4 text-left text-[12.5px] leading-3 text-gray-800 dark:text-white">
          {prompt.name}
        </div>
      </button>

      {isDeleting && (
        <div className="absolute right-1 z-10 flex text-gray-600 dark:text-gray-300">
          <SidebarActionButton handleClick={handleDelete}>
            <IconCheck size={18} />
          </SidebarActionButton>

          <SidebarActionButton handleClick={handleCancelDelete}>
            <IconX size={18} />
          </SidebarActionButton>
        </div>
      )}

      {!isDeleting && !prompt.factory && (
        <div className="absolute right-1 z-10 flex text-gray-600 dark:text-gray-300">
          <SidebarActionButton handleClick={handleConfirmDelete}>
            <IconTrash size={18} />
          </SidebarActionButton>
        </div>
      )}

      {showModal && (
        <PromptEditModal prompt={prompt} onClose={() => setShowModal(false)} onUpdatePrompt={handleUpdate} />
      )}
    </div>
  )
}

export default PromptListItem
