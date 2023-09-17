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
