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
import {IconBuildingFactory2, IconCheck, IconPencil, IconTrash, IconUserCircle, IconX} from "@tabler/icons-react"
import {DragEvent, MouseEventHandler, useContext, useState} from "react"

import PromptBarContext from "../PromptBar.context"
import PromptEditModal from "./PromptEditModal"
import SidebarActionButton from "@/components/Buttons/SidebarActionButton"
import {useHomeContext} from "@/pages/api/home/home.context"
import {Prompt} from "@/types/prompt"

interface Props {
  prompt: Prompt
}

export const PromptListItem = ({prompt}: Props) => {
  const {dispatch: promptDispatch, handleUpdatePrompt, handleDeletePrompt} = useContext(PromptBarContext)
  const {dispatch: homeDispatch} = useHomeContext()

  const [showEditPromptModal, setShowEditPromptModal] = useState<boolean>(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleUpdate = (prompt: Prompt) => {
    setShowEditPromptModal(false)
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

  const handleCloseEditPromptModal = () => {
    return () => setShowEditPromptModal(false)
  }

  const handleShowEditPromptModal: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation()
    setShowEditPromptModal(true)
  }

  return (
    <div className="relative flex items-center">
      <button
        className="flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 text-sm text-gray-800 transition-colors duration-200 hover:bg-gray-300 dark:text-white dark:hover:bg-[#343541]/90"
        draggable={prompt.factory ? "false" : "true"}
        onClick={() => homeDispatch({field: "triggerSelectedPrompt", value: prompt})}
        onDragStart={(e) => handleDragStart(e, prompt)}
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

      {!isDeleting && (
        <div className="absolute right-1 z-10 flex text-gray-600 dark:text-gray-300">
          <SidebarActionButton handleClick={handleShowEditPromptModal}>
            <IconPencil size={18} />
          </SidebarActionButton>
          {!prompt.factory && (
            <SidebarActionButton handleClick={handleConfirmDelete}>
              <IconTrash size={18} />
            </SidebarActionButton>
          )}
        </div>
      )}

      {showEditPromptModal && (
        <PromptEditModal prompt={prompt} onClose={handleCloseEditPromptModal()} onUpdatePrompt={handleUpdate} />
      )}
    </div>
  )
}

export default PromptListItem
