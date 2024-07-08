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

import {useTranslation} from "next-i18next"
import React, {useEffect, useRef} from "react"

import {Plugin, PluginList} from "@/types/plugin"
import {isKeyboardEnter} from "@/utils/app/keyboard"

interface Props {
  plugin: Plugin | null
  onPluginChange: (plugin: Plugin) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLSelectElement>) => void
}

export const PluginSelect = ({plugin, onPluginChange, onKeyDown}: Props) => {
  const {t} = useTranslation("common")

  const selectRef = useRef<HTMLSelectElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLSelectElement>) => {
    const selectElement = selectRef.current
    const optionCount = selectElement?.options.length ?? 0

    if (e.key === "/" && e.metaKey) {
      e.preventDefault()
      if (selectElement) {
        if (e.shiftKey) {
          selectElement.selectedIndex = (selectElement.selectedIndex - 1 + optionCount) % optionCount
          selectElement.dispatchEvent(new Event("change"))
        } else {
          selectElement.selectedIndex = (selectElement.selectedIndex + 1) % optionCount
          selectElement.dispatchEvent(new Event("change"))
        }
      }
    } else if (isKeyboardEnter(e)) {
      e.preventDefault()
      if (selectElement) {
        selectElement.dispatchEvent(new Event("change"))
      }
      onPluginChange(PluginList.find((plugin) => plugin.name === selectElement?.selectedOptions[0].innerText) as Plugin)
    } else {
      onKeyDown(e)
    }
  }

  useEffect(() => {
    if (selectRef.current) {
      selectRef.current.focus()
    }
  }, [])

  return (
    <div className="flex flex-col">
      <div className="mb-1 w-full rounded border border-neutral-200 bg-transparent pr-2 text-neutral-900 dark:border-neutral-600 dark:text-white">
        <select
          ref={selectRef}
          className="w-full cursor-pointer bg-transparent p-2"
          value={plugin?.id ?? ""}
          onChange={(e) => {
            onPluginChange(PluginList.find((plugin) => plugin.id === e.target.value) as Plugin)
          }}
          onKeyDown={(e) => {
            handleKeyDown(e)
          }}
        >
          <option key="chatgpt" value="chatgpt" className="dark:bg-[#343541] dark:text-white">
            ChatGPT
          </option>

          {PluginList.map((plugin) => (
            <option key={plugin.id} value={plugin.id} className="dark:bg-[#343541] dark:text-white">
              {plugin.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default PluginSelect
