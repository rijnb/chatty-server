import React, {useEffect, useRef, useState} from "react"

import {isKeyboardEnter} from "@/utils/app/keyboard"

interface Props {
  content: string
  onChange: (content: string) => void
  onSave: () => void
}

const ResponsiveTextArea = ({content, onChange, onSave}: Props) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isTyping, setIsTyping] = useState<boolean>(false)

  const resizeTextArea = (textareaRef: React.RefObject<HTMLTextAreaElement>) => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  useEffect(() => {
    resizeTextArea(textareaRef)
  }, [])

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value)
    resizeTextArea(textareaRef)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isKeyboardEnter(e) && !isTyping && !(e.shiftKey || e.altKey)) {
      e.preventDefault()
      onSave()
    }
  }

  return (
    <textarea
      ref={textareaRef}
      className="w-full resize-none whitespace-pre-line border-none dark:bg-[#343541]"
      value={content}
      onChange={handleContentChange}
      onKeyDown={handleKeyDown}
      onCompositionStart={() => setIsTyping(true)}
      onCompositionEnd={() => setIsTyping(false)}
      style={{
        fontFamily: "inherit",
        fontSize: "inherit",
        lineHeight: "inherit",
        padding: "0",
        margin: "0",
        overflow: "hidden"
      }}
    />
  )
}

export default ResponsiveTextArea
