import React, {useCallback, useEffect} from "react"

interface Props {
  className: string
  onClose?: () => void
  onClickAway?: () => void
  children: React.ReactNode
}

export const ModalDialog = ({className, children, onClose, onClickAway}: Props) => {
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
        onClose?.()
      }
    },
    [onClose]
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleClickAway}
    >
      <div className={className}>{children}</div>
    </div>
  )
}
