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

import {IconRobot} from "@tabler/icons-react"

interface Props {}

export const ChatLoader = ({}: Props) => {
  return (
    <div
      className="group border-b border-black/10 bg-gray-50 text-gray-800 dark:border-gray-900/50 dark:bg-[#444654] dark:text-gray-100 md:px-4"
      style={{overflowWrap: "anywhere"}}
    >
      <div className="m-auto flex max-w-2xl gap-2 p-4 px-0 py-4 text-base">
        <div className="min-w-[40px] items-end">
          <IconRobot size={30} color="#44aa88" />
        </div>
        <span className="mt-1 animate-pulse cursor-default">▍</span>
      </div>
    </div>
  )
}

export default ChatLoader
