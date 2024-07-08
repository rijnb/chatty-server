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
