import React, {useCallback, useEffect} from "react"

interface Props {
  className: string
  isOpen: boolean
  onClose?: () => void
  children: React.ReactNode
}

export const ModalOverlay = ({className, children, isOpen, onClose}: Props) => {
  const handleClickAway = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (onClose && e.target === e.currentTarget) {
        onClose()
      }
    },
    [onClose]
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      console.log("key down", e.key)
      if (e.key === "Escape") {
        if (onClose && e.key === "Escape") {
          onClose()
        }
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      console.log("adding event listener")
      window.addEventListener("keydown", handleKeyDown)
      return () => {
        console.log("removing event listener")
        window.removeEventListener("keydown", handleKeyDown)
      }
    }
  }, [handleKeyDown, isOpen])

  return (
    isOpen && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        onClick={handleClickAway}
      >
        <div className={className}>{children}</div>
      </div>
    )
  )
}
