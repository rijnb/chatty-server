import {IconRobot, IconUser} from "@tabler/icons-react"
import React, {FC, memo} from "react"

import AssistantMessage from "@/components/Chat/AssistantMessage"
import MessageRow from "@/components/Chat/MessageRow"
import UserMessage from "@/components/Chat/UserMessage"
import {useHomeContext} from "@/pages/api/home/home.context"
import {Conversation, Message} from "@/types/chat"

export interface Props {
  conversation: Conversation
  message: Message
  messageIndex: number
  messageIsStreaming: boolean
  onDeleteMessage: () => void
  onEdit: (editedMessage: Message) => void
}

export const ChatMessage: FC<Props> = memo(
  ({conversation, message, messageIndex, messageIsStreaming, onDeleteMessage, onEdit}) => {
    return message.role === "assistant" ? (
      <MessageRow
        className="group border-b border-black/10 bg-gray-50 px-4 text-gray-800 dark:border-gray-900/50 dark:bg-[#444654] dark:text-gray-100"
        icon={<IconRobot size={30} />}
      >
        <AssistantMessage
          message={message}
          isComplete={messageIndex < (conversation.messages.length ?? 0) - 1 || !messageIsStreaming}
          onDeleteMessage={onDeleteMessage}
        />
      </MessageRow>
    ) : (
      <MessageRow
        className="group border-b border-black/10 bg-white px-4 text-gray-800 dark:border-gray-900/50 dark:bg-[#343541] dark:text-gray-100"
        icon={<IconUser size={30} />}
      >
        <UserMessage message={message} onDeleteMessage={onDeleteMessage} onSaveMessage={onEdit} />
      </MessageRow>
    )
  }
)

ChatMessage.displayName = "ChatMessage"
export default ChatMessage
