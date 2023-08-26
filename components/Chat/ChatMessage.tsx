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
