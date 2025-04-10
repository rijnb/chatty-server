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
import React, {useEffect, useRef} from "react"

import {isKeyboardEnter} from "@/utils/app/keyboard"

export interface Props {
  className?: string
  onSubmit?: () => void
  onCancel?: () => void
  onClose?: () => void
  onClickAway?: () => void
  children: React.ReactNode
}

export const ModalDialog = ({className, children, onSubmit, onCancel, onClickAway, onClose}: Props) => {
  const modalRef = useRef<HTMLDivElement>(null)

  const handleClickAway = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.target === e.currentTarget) {
      if (onClickAway) {
        onClickAway()
      } else if (onClose) {
        onClose()
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      onCancel?.()
      onClose?.()
    } else if (isKeyboardEnter(e) && !(e.shiftKey || e.altKey)) {
      e.preventDefault()
      onSubmit?.()
    }
  }

  useEffect(() => {
    modalRef.current?.focus()
  }, [])

  return (
    <div
      ref={modalRef}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onKeyDown={handleKeyDown}
      onClick={handleClickAway}
    >
      <div className={className}>{children}</div>
    </div>
  )
}
