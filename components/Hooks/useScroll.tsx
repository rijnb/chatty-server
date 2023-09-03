import React, {useCallback, useState} from "react"

import {throttle} from "@/utils/data/throttle"

const useScroll = (container: React.RefObject<HTMLDivElement>) => {
  const [showScrollDownButton, setShowScrollDownButton] = useState<boolean>(false)
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true)

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

  const autoscroll = throttle(() => {
    if (!autoScrollEnabled) {
      return
    }

    jumpToBottom()
  }, 250)

  return {
    showScrollDownButton,
    handleScroll,
    jumpToBottom,
    autoscroll
  }
}

export default useScroll
