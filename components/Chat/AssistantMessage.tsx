import {IconCheck, IconCopy, IconTrash} from "@tabler/icons-react"
import React, {useState} from "react"

import MessageMarkdown from "@/components/Chat/MessageMarkdown"
import {Message} from "@/types/chat"

interface Props {
  message: Message
  isComplete: boolean
  onDeleteMessage: () => void
}

export const AssistantMessage = ({message, isComplete, onDeleteMessage}: Props) => {
  const [messagedCopied, setMessageCopied] = useState(false)

  const handleCopyOnClick = () => {
    if (!navigator.clipboard) {
      return
    }

    navigator.clipboard.writeText(message.content).then(() => {
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
        {messagedCopied ? (
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
