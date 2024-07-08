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
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconLayoutSidebarRightCollapse,
  IconLayoutSidebarRightExpand
} from "@tabler/icons-react"

interface Props {
  onClick: any
  isOpen: boolean
  side: "left" | "right"
}

export const OpenCloseSidebarButton = ({onClick, isOpen, side}: Props) => {
  const withoutBorder =
    " flex flex-shrink-0 cursor-pointer items-center gap-3 text-sm text-gray-800 transition-colors duration-200 hover:bg-gray-200/10 dark:border-gray-600/20 dark:text-white dark:hover:bg-gray-700/10"
  const withBorder = withoutBorder + " gap-3 rounded-md border border-gray-300 p-3"
  const spaceLeft = "ml-2" + withBorder
  const noSpaceLeft = "ml-0" + withBorder
  return isOpen ? (
    side === "right" ? (
      <button className={spaceLeft} onClick={onClick} title="Collapse sidebar">
        <IconLayoutSidebarRightCollapse size={18} />
      </button>
    ) : (
      <button className={noSpaceLeft} onClick={onClick} title="Collapse sidebar">
        <IconLayoutSidebarLeftCollapse size={18} />
      </button>
    )
  ) : side === "right" ? (
    <button className={withoutBorder} onClick={onClick} title="Expand sidebar">
      <IconLayoutSidebarRightExpand size={18} />
    </button>
  ) : (
    <button className={withoutBorder} onClick={onClick} title="Expand sidebar">
      <IconLayoutSidebarLeftExpand size={18} />
    </button>
  )
}

export default OpenCloseSidebarButton
