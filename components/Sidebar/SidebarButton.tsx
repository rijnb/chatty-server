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
import React from "react"

interface Props {
  text: string
  icon: React.JSX.Element
  onClick: () => void
  highlight?: boolean
}

export const SidebarButton = ({text, icon, onClick, highlight}: Props) => {
  return (
    <button
      className={
        highlight
          ? "flex w-full cursor-pointer select-none items-center gap-3 rounded-md px-3 py-3 text-[14px] leading-3 text-red-800 transition-colors duration-200 hover:bg-gray-300 dark:text-red-400 dark:hover:bg-[#343541]/90"
          : "flex w-full cursor-pointer select-none items-center gap-3 rounded-md px-3 py-3 text-[14px] leading-3 text-gray-800 transition-colors duration-200 hover:bg-gray-300 dark:text-white dark:hover:bg-[#343541]/90"
      }
      onClick={onClick}
    >
      <div>{icon}</div>
      <span>{text}</span>
    </button>
  )
}

export default SidebarButton
