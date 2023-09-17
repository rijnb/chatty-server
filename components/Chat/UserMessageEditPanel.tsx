import {useTranslation} from "next-i18next"
import React, {useState} from "react"

import ResponsiveTextArea from "@/components/Chat/ResponsiveTextArea"
import {Message} from "@/types/chat"

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

export default EditPanel
