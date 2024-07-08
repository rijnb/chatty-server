import {useTranslation} from "next-i18next"
import React, {useState} from "react"

import ResponsiveTextArea from "@/components/Chat/ResponsiveTextArea"
import MemoizedReactMarkdown from "@/components/Markdown/MemoizedReactMarkdown"
import {
  Message,
  MessagePartImage,
  MessagePartText,
  UserMessage,
  getMessageAsImageUrlsOnly,
  getMessageAsString,
  getMessageAsStringOnlyText
} from "@/types/chat"

interface EditPanelProps {
  message: Message
  onSaveMessage: (message: Message) => void
  onFinishEditing: () => void
}

const EditPanel = ({message, onSaveMessage, onFinishEditing}: EditPanelProps) => {
  const {t} = useTranslation("common")
  const [content, setContent] = useState(message.content)

  const handleSaveMessage = () => {
    const imageUrls = getMessageAsImageUrlsOnly(message)
    const newMessage: UserMessage = {role: "user", content: content!}
    if (imageUrls.length === 0) {
      onSaveMessage(newMessage)
    } else {
      const partText: MessagePartText = {type: "text", text: getMessageAsString(newMessage)}
      let partImages: MessagePartImage[] = []
      imageUrls.forEach((url) => partImages.push({type: "image_url", image_url: {url}}))
      const newMultiMessage: Message = {role: "user", content: [partText, ...partImages]}
      onSaveMessage(newMultiMessage)
    }
    onFinishEditing()
  }

  const imageUrls = getMessageAsImageUrlsOnly(message)
  const imagesMarkdown = imageUrls.map((image, index) => `![Image ${index}](${image})`).join("\t")
  return (
    <div className="flex w-full flex-col">
      <ResponsiveTextArea content={content!} onChange={setContent} onSave={handleSaveMessage} />
      <MemoizedReactMarkdown>{imagesMarkdown}</MemoizedReactMarkdown>
      <div className="mt-10 flex justify-center space-x-4">
        <button
          className="h-[40px] rounded-md bg-blue-500 px-4 py-1 text-sm font-medium text-white enabled:hover:bg-blue-600 disabled:opacity-50"
          onClick={handleSaveMessage}
          disabled={!message.content?.length || message.content?.length <= 0}
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
