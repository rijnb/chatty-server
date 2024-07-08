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

import {IconCheck, IconCopy, IconTrash} from "@tabler/icons-react"
import React, {useState} from "react"

import MessageMarkdown from "@/components/Chat/MessageMarkdown"
import {Message, getMessageAsString} from "@/types/chat"

interface Props {
  message: Message
  isComplete: boolean
  onDeleteMessage: () => void
}

export const AssistantMessage = ({message, isComplete, onDeleteMessage}: Props) => {
  const [messageCopied, setMessageCopied] = useState(false)

  const handleCopyOnClick = () => {
    if (!navigator.clipboard) {
      return
    }

    // !! TODO: Check if this is OK
    navigator.clipboard.writeText(getMessageAsString(message)).then(() => {
      setMessageCopied(true)
      setTimeout(() => {
        setMessageCopied(false)
      }, 2000)
    })
  }

  return (
    <div className="flex flex-row">
      <MessageMarkdown message={message} isComplete={isComplete} />
      <div className="mx-0 flex flex-row items-start justify-start gap-1">
        {messageCopied ? (
          <IconCheck size={20} className="text-green-500 dark:text-green-400" />
        ) : (
          <button
            className="invisible text-gray-500 hover:text-gray-700 group-hover:visible dark:text-gray-400 dark:hover:text-gray-300"
            onClick={handleCopyOnClick}
          >
            <IconCopy size={20} />
          </button>
        )}
        {isComplete ? (
          <button
            className="invisible text-gray-500 hover:text-gray-700 group-hover:visible dark:text-gray-400 dark:hover:text-gray-300"
            onClick={onDeleteMessage}
          >
            <IconTrash size={20} />
          </button>
        ) : (
          <IconTrash size={20} className="invisible" />
        )}
      </div>
    </div>
  )
}

export default AssistantMessage
