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

import {MutableRefObject, useEffect, useRef, useState} from "react"

import {Prompt} from "@/types/prompt"

interface Props {
  prompts: Prompt[]
  activePromptIndex: number
  onSelect: () => void
  onMouseOver: (index: number) => void
  promptListRef: MutableRefObject<HTMLUListElement | null>
}

export const PromptPopupList = ({prompts, activePromptIndex, onSelect, onMouseOver, promptListRef}: Props) => {
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeout = useRef<NodeJS.Timeout>()

  const handleScroll = () => {
    setIsScrolling(true)
    clearTimeout(scrollTimeout.current)
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false)
    }, 250)
  }

  useEffect(() => {
    let ref = promptListRef.current
    ref?.addEventListener("scroll", handleScroll)
    return () => {
      ref?.removeEventListener("scroll", handleScroll)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ul
      ref={promptListRef}
      className="z-10 max-h-52 w-full overflow-scroll rounded border border-black/10 bg-white shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:border-neutral-500 dark:bg-[#343541] dark:text-white dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]"
    >
      {prompts.map(
        (
          prompt,
          index // Do not sort the prompts, the selection is index-based.
        ) => (
          <li
            key={prompt.id}
            className={`${
              index === activePromptIndex ? "bg-gray-200 dark:bg-[#202123] dark:text-black" : ""
            } cursor-pointer px-3 py-2 text-sm text-black dark:text-white`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onSelect()
            }}
            onMouseEnter={() => {
              if (!isScrolling) {
                onMouseOver(index)
              }
            }}
          >
            {(prompt.factory ? "🛠" : "👤") + " " + prompt.name}
          </li>
        )
      )}
    </ul>
  )
}

export default PromptPopupList
