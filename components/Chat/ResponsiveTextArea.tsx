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

import React, {useEffect, useRef, useState} from "react"

import {MessagePart, getMessageAsStringOnlyText} from "@/types/chat"
import {isKeyboardEnter} from "@/utils/app/keyboard"

interface Props {
  content: string | MessagePart[]
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

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value)
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
      value={getMessageAsStringOnlyText({role: "user", content: content})}
      onChange={handleChange}
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
