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
import {IconFolderPlus, IconMistOff, IconTextPlus} from "@tabler/icons-react"
import {ReactNode} from "react"
import {useTranslation} from "react-i18next"

import Search from "../Search"
import {OpenCloseSidebarButton} from "./components/OpenCloseSidebarButton"

interface Props<T> {
  isOpen: boolean
  addItemButtonTitle: string
  side: "left" | "right"
  items: T[]
  listItem: ReactNode
  folderListItem: ReactNode
  footerComponent?: ReactNode
  searchTerm: string
  handleSearchTerm: (searchTerm: string) => void
  toggleOpen: () => void
  handleCreateItem: () => void
  handleCreateFolder: () => void
  handleDrop: (e: any) => void
}

const Sidebar = <T,>({
  isOpen,
  addItemButtonTitle,
  side,
  items,
  listItem,
  folderListItem,
  footerComponent,
  searchTerm,
  handleSearchTerm,
  toggleOpen,
  handleCreateItem,
  handleCreateFolder,
  handleDrop
}: Props<T>) => {
  const {t} = useTranslation("common")

  const handleDragOver = (e: any) => {
    e.preventDefault()
  }

  const handleDragEnter = (e: any) => {
    e.target.style.background = "#343541"
  }

  const handleDragLeave = (e: any) => {
    e.target.style.background = "none"
  }

  return isOpen ? (
    <div className="relative">
      <div
        className={`${side}-0 relative top-0 z-40 flex h-full w-[260px] flex-none flex-col space-y-2 bg-gray-100 p-2 text-[14px] transition-all dark:bg-[#202123]`}
      >
        <div className="flex items-center">
          {side === "right" ? (
            <button
              className="ml-0 flex flex-shrink-0 cursor-pointer items-center gap-3 rounded-md border border-gray-300 p-3 text-sm text-gray-800 transition-colors duration-200 hover:bg-gray-200/10 dark:border-gray-600/20 dark:text-white dark:hover:bg-gray-700/10"
              onClick={handleCreateFolder}
              title="Create folder"
            >
              <IconFolderPlus size={16} />
            </button>
          ) : (
            <OpenCloseSidebarButton onClick={toggleOpen} isOpen={isOpen} side={side} />
          )}

          <button
            className="text-sidebar ml-2 flex w-[142px] flex-shrink-0 cursor-pointer select-none items-center gap-3 rounded-md border border-gray-300 p-3 text-gray-800 transition-colors duration-200 hover:bg-gray-200/10 dark:border-gray-600/20 dark:text-white dark:hover:bg-gray-700/10"
            onClick={() => {
              handleCreateItem()
              handleSearchTerm("")
            }}
          >
            <IconTextPlus size={16} />
            {addItemButtonTitle}
          </button>

          {side === "left" ? (
            <button
              className="ml-2 flex flex-shrink-0 cursor-pointer items-center gap-3 rounded-md border border-gray-300 p-3 text-sm text-gray-800 transition-colors duration-200 hover:bg-gray-200/10 dark:border-gray-600/20 dark:text-white dark:hover:bg-gray-700/10"
              onClick={handleCreateFolder}
              title="Create folder"
            >
              <IconFolderPlus size={16} />
            </button>
          ) : (
            <OpenCloseSidebarButton onClick={toggleOpen} isOpen={isOpen} side={side} />
          )}
        </div>
        <Search placeholder={t("Search...")} searchTerm={searchTerm} onSearch={handleSearchTerm} />

        <div className="flex-grow overflow-auto">
          {items?.length > 0 && (
            <div className="flex border-b border-gray-200 pb-2 dark:border-gray-600/20">{folderListItem}</div>
          )}

          {items?.length > 0 ? (
            <div
              className="pt-2"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
            >
              {listItem}
            </div>
          ) : (
            <div className="mt-8 select-none text-center text-black opacity-50 dark:text-white">
              <IconMistOff className="mx-auto mb-3" />
              <span className="text-[14px] leading-normal">{t("Empty.")}</span>
            </div>
          )}
        </div>
        {footerComponent}
      </div>
    </div>
  ) : (
    <div
      className={`${side}-0 relative top-0 z-40 flex h-full flex-none space-y-2 bg-gray-100 p-1 transition-transform dark:bg-[#202123]`}
    >
      <OpenCloseSidebarButton onClick={toggleOpen} isOpen={isOpen} side={side} />
    </div>
  )
}

export default Sidebar
