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

import {IconRobot, IconUser} from "@tabler/icons-react"
import React from "react"

import AssistantMessage from "@/components/Chat/AssistantMessage"
import MessageRow from "@/components/Chat/MessageRow"
import UserMessage from "@/components/Chat/UserMessage"
import {Message} from "@/types/chat"

interface Props {
  message: Message
  isComplete: boolean
  onDelete: () => void
  onEdit: (editedMessage: Message) => void
}

const ChatMessage = ({message, isComplete, onDelete, onEdit}: Props) => {
  return message.role === "assistant" ? (
    <MessageRow
      className="group border-b border-black/10 bg-gray-50 px-4 text-gray-800 dark:border-gray-900/50 dark:bg-[#444654] dark:text-gray-100"
      icon={<IconRobot size={30} />}
    >
      <AssistantMessage message={message} isComplete={isComplete} onDeleteMessage={onDelete} />
    </MessageRow>
  ) : (
    <MessageRow
      className="group border-b border-black/10 bg-white px-4 text-gray-800 dark:border-gray-900/50 dark:bg-[#343541] dark:text-gray-100"
      icon={<IconUser size={30} />}
    >
      <UserMessage message={message} onDeleteMessage={onDelete} onSaveMessage={onEdit} />
    </MessageRow>
  )
}

export default ChatMessage
