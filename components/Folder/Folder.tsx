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

import {
  IconArrowBadgeDown,
  IconArrowBadgeRight,
  IconCaretDown,
  IconCaretRight,
  IconCheck,
  IconPencil,
  IconTrash,
  IconX
} from "@tabler/icons-react"
import {KeyboardEvent, ReactElement, useContext, useEffect, useState} from "react"

import SidebarActionButton from "@/components/Buttons/SidebarActionButton"
import HomeContext from "@/pages/api/home/home.context"
import {FolderInterface} from "@/types/folder"
import {isKeyboardEnter} from "@/utils/app/keyboard"

interface Props {
  folder: FolderInterface
  searchTerm: string
  allowDrop: boolean
  handleDrop: (e: any, folder: FolderInterface) => void
  folderComponent: (ReactElement | undefined)[]
}

const Folder = ({folder, searchTerm, allowDrop, handleDrop, folderComponent}: Props) => {
  const {handleDeleteFolder, handleUpdateFolder} = useContext(HomeContext)

  const [isDeleting, setIsDeleting] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isKeyboardEnter(e)) {
      e.preventDefault()
      handleRename()
    }
  }

  const handleRename = () => {
    handleUpdateFolder(folder.id, renameValue)
    setRenameValue("")
    setIsRenaming(false)
  }

  const dropHandler = (e: any) => {
    if (!allowDrop) {
      return
    }
    if (e.dataTransfer) {
      setIsOpen(true)
      handleDrop(e, folder)
      e.target.style.background = "none"
    }
  }

  const handleDragOver = (e: any) => {
    e.preventDefault()
  }

  const handleDragEnter = (e: any) => {
    if (!allowDrop) {
      return
    }
    e.target.style.background = "#343541"
  }

  const handleDragLeave = (e: any) => {
    if (!allowDrop) {
      return
    }
    e.target.style.background = "none"
  }

  useEffect(() => {
    if (isRenaming) {
      setIsDeleting(false)
    } else if (isDeleting) {
      setIsRenaming(false)
    }
  }, [isRenaming, isDeleting])

  useEffect(() => {
    if (searchTerm) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }, [searchTerm])

  return (
    <>
      <div className="relative flex items-center">
        {isRenaming ? (
          <div className="flex w-full items-center gap-3 rounded-lg bg-gray-200 p-3 text-gray-800 dark:bg-[#343541]/90 dark:text-white">
            {isOpen ? (
              folder.factory ? (
                <IconCaretDown size={18} />
              ) : (
                <IconArrowBadgeDown size={18} />
              )
            ) : folder.factory ? (
              <IconArrowBadgeRight size={18} color={"gray"} />
            ) : (
              <IconCaretRight size={18} />
            )}
            <input
              className="mr-12 flex-1 overflow-hidden overflow-ellipsis border-gray-300 bg-transparent text-left text-[12.5px] leading-3 text-gray-800 outline-none focus:border-gray-500 dark:border-neutral-400 dark:bg-transparent dark:text-white focus:dark:border-neutral-100"
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
        ) : (
          <button
            className={
              "flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 text-sm text-gray-800 transition-colors duration-200 hover:bg-gray-300 dark:text-white dark:hover:bg-[#343541]/90"
            }
            onClick={() => setIsOpen(!isOpen)}
            onDrop={(e) => dropHandler(e)}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
          >
            {isOpen ? (
              folder.factory ? (
                <IconArrowBadgeDown size={18} color={"gray"} />
              ) : (
                <IconCaretDown size={18} />
              )
            ) : folder.factory ? (
              <IconArrowBadgeRight size={18} color={"gray"} />
            ) : (
              <IconCaretRight size={18} />
            )}

            <div className="relative max-h-8 flex-1 overflow-hidden text-ellipsis whitespace-nowrap break-all pr-12 text-left text-[12.5px] leading-3 text-gray-800 dark:text-white">
              {folder.name}
            </div>
          </button>
        )}

        {(isDeleting || isRenaming) && (
          <div className="absolute right-1 z-10 flex text-gray-600 dark:text-gray-300">
            <SidebarActionButton
              handleClick={(e) => {
                e.stopPropagation()

                if (isDeleting) {
                  handleDeleteFolder(folder.id)
                } else if (isRenaming) {
                  handleRename()
                }

                setIsDeleting(false)
                setIsRenaming(false)
              }}
            >
              <IconCheck size={18} />
            </SidebarActionButton>
            <SidebarActionButton
              handleClick={(e) => {
                e.stopPropagation()
                setIsDeleting(false)
                setIsRenaming(false)
              }}
            >
              <IconX size={18} />
            </SidebarActionButton>
          </div>
        )}

        {!isDeleting && !isRenaming && !folder.factory && (
          <div className="absolute right-1 z-10 flex text-gray-600 dark:text-gray-300">
            <SidebarActionButton
              handleClick={(e) => {
                e.stopPropagation()
                setIsRenaming(true)
                setRenameValue(folder.name)
              }}
            >
              <IconPencil size={18} />
            </SidebarActionButton>
            <SidebarActionButton
              handleClick={(e) => {
                e.stopPropagation()
                setIsDeleting(true)
              }}
            >
              <IconTrash size={18} />
            </SidebarActionButton>
          </div>
        )}
      </div>

      {isOpen ? folderComponent : null}
    </>
  )
}

export default Folder
