import React, {useCallback, useEffect, useRef} from "react"

interface Props {
  className: string
  onSubmit?: () => void
  onCancel?: () => void
  onClose?: () => void
  onClickAway?: () => void
  children: React.ReactNode
}

export const ModalDialog = ({className, children, onSubmit, onCancel, onClickAway, onClose}: Props) => {
  const modalRef = useRef<HTMLDivElement>(null)

  const handleClickAway = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (e.target === e.currentTarget) {
        if (onClickAway) {
          onClickAway()
        } else if (onClose) {
          onClose()
        }
      }
    },
    [onClickAway, onClose]
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel?.()
        onClose?.()
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        onSubmit?.()
      }
    },
    [onClose]
  )

  useEffect(() => {
    modalRef.current?.focus()
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])

  return (
    <div
      ref={modalRef}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleClickAway}
    >
      <div className={className}>{children}</div>
    </div>
  )
}