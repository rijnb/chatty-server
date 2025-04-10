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
import {IconEdit, IconTrash} from "@tabler/icons-react"
import React, {useState} from "react"

import MessageMarkdown from "@/components/Chat/MessageMarkdown"
import UserMessageEditPanel from "@/components/Chat/UserMessageEditPanel"
import {Message} from "@/types/chat"

interface UserMessageProps {
  message: Message
  onDeleteMessage: () => void
  onSaveMessage: (message: Message) => void
}

const UserMessage = ({message, onSaveMessage, onDeleteMessage}: UserMessageProps) => {
  const [isEditing, setIsEditing] = useState(false)

  return isEditing ? (
    <div className="flex w-full">
      <UserMessageEditPanel
        message={message}
        onSaveMessage={onSaveMessage}
        onFinishEditing={() => setIsEditing(false)}
      />
    </div>
  ) : (
    <div className="flex w-full">
      <MessageMarkdown message={message} isComplete={true} />
      <div className="mx-0 flex flex-row items-start justify-start gap-1">
        <button
          className="invisible text-gray-500 hover:text-gray-700 group-hover:visible dark:text-gray-400 dark:hover:text-gray-300"
          onClick={() => {
            setIsEditing(true)
          }}
        >
          <IconEdit size={20} />
        </button>
        <button
          className="invisible text-gray-500 hover:text-gray-700 group-hover:visible dark:text-gray-400 dark:hover:text-gray-300"
          onClick={onDeleteMessage}
        >
          <IconTrash size={20} />
        </button>
      </div>
    </div>
  )
}

export default UserMessage
