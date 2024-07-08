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

import {IconCheck, IconTrash, IconX} from "@tabler/icons-react"
import {useTranslation} from "next-i18next"
import {useState} from "react"

import SidebarButton from "@/components/Sidebar/SidebarButton"

interface Props {
  onClearPrompts: () => void
}

export const ClearPrompts = ({onClearPrompts}: Props) => {
  const [isConfirming, setIsConfirming] = useState<boolean>(false)

  const {t} = useTranslation("common")

  const handleClearPrompts = () => {
    onClearPrompts()
    setIsConfirming(false)
  }

  return isConfirming ? (
    <div className="flex w-full cursor-pointer items-center rounded-lg px-3 py-3 text-gray-800 hover:bg-gray-300 dark:text-white dark:hover:bg-[#343541]/90">
      <IconTrash size={18} />

      <div className="ml-3 flex-1 text-left text-[12.5px] leading-3 text-gray-800 dark:text-white">
        {t("Are you sure?")}
      </div>

      <div className="flex w-[40px]">
        <IconCheck
          className="ml-auto mr-1 min-w-[20px] text-gray-500 hover:text-gray-700 dark:text-neutral-300 dark:hover:text-neutral-100"
          size={18}
          onClick={(e) => {
            e.stopPropagation()
            handleClearPrompts()
          }}
        />

        <IconX
          className="ml-auto min-w-[20px] text-gray-500 hover:text-gray-700 dark:text-neutral-300 dark:hover:text-neutral-100"
          size={18}
          onClick={(e) => {
            e.stopPropagation()
            setIsConfirming(false)
          }}
        />
      </div>
    </div>
  ) : (
    <SidebarButton
      text={t("Reset to factory prompts")}
      icon={<IconTrash size={18} />}
      onClick={() => setIsConfirming(true)}
    />
  )
}

export default ClearPrompts
