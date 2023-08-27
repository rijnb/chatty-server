import React, {useEffect, useRef} from "react"

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
    } else if (e.key === "Enter" && !e.shiftKey) {
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
