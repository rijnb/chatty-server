import {IconEdit, IconTrash} from "@tabler/icons-react"
import {useTranslation} from "next-i18next"
import React, {useState} from "react"

import MessageMarkdown from "@/components/Chat/MessageMarkdown"
import ResponsiveTextArea from "@/components/Chat/ResponsiveTextArea"
import {Message} from "@/types/chat"

interface UserMessageProps {
  message: Message
  onDeleteMessage: () => void
  onSaveMessage: (message: Message) => void
}

interface EditPanelProps {
  message: Message
  onSaveMessage: (message: Message) => void
  onFinishEditing: () => void
}
const EditPanel = ({message, onSaveMessage, onFinishEditing}: EditPanelProps) => {
  const {t} = useTranslation("common")
  const [content, setContent] = useState(message.content)

  const handleSaveMessage = () => {
    onSaveMessage({...message, content})
    onFinishEditing()
  }

  return (
    <div className="flex w-full flex-col">
      <ResponsiveTextArea content={content} onChange={setContent} onSave={handleSaveMessage} />
      <div className="mt-10 flex justify-center space-x-4">
        <button
          className="h-[40px] rounded-md bg-blue-500 px-4 py-1 text-sm font-medium text-white enabled:hover:bg-blue-600 disabled:opacity-50"
          onClick={handleSaveMessage}
          disabled={content.trim().length <= 0}
        >
          {t("Save & submit")}
        </button>
        <button
          className="h-[40px] rounded-md border border-neutral-300 px-4 py-1 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          onClick={onFinishEditing}
        >
          {t("Cancel")}
        </button>
      </div>
    </div>
  )
}

const UserMessage = ({message, onSaveMessage, onDeleteMessage}: UserMessageProps) => {
  const {t} = useTranslation("common")
  const [isEditing, setIsEditing] = useState(false)

  return isEditing ? (
    <div className="flex w-full">
      <EditPanel message={message} onSaveMessage={onSaveMessage} onFinishEditing={() => setIsEditing(false)} />
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
