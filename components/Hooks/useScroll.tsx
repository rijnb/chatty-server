import React, {useCallback, useState} from "react"

const useScroll = (container: React.RefObject<HTMLDivElement>) => {
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true)
  const [showScrollDownButton, setShowScrollDownButton] = useState<boolean>(false)

  const handleScroll = () => {
    if (container.current) {
      const {scrollTop, scrollHeight, clientHeight} = container.current
      const bottomTolerance = 30

      if (scrollTop + clientHeight < scrollHeight - bottomTolerance) {
        setAutoScrollEnabled(false)
        setShowScrollDownButton(true)
      } else {
        setAutoScrollEnabled(true)
        setShowScrollDownButton(false)
      }
    }
  }

  const jumpToBottom = useCallback(() => {
    container.current?.scrollTo({
      top: container.current.scrollHeight,
      behavior: "auto"
    })
  }, [container])

  const scrollToBottom = () => {
    container.current?.scrollTo({
      top: container.current.scrollHeight,
      behavior: "smooth"
    })
  }

  return {
    showScrollDownButton,
    handleScroll,
    jumpToBottom,
    scrollToBottom
  }
}

export default useScroll
