import React, {useEffect} from "react"

const useClickAway = (container: React.RefObject<HTMLDivElement>, enabled: boolean, onClickAway: () => void) => {
  useEffect(() => {
    if (!enabled) {
      return
    }

    const handleClickAway = (e: MouseEvent) => {
      if (container.current && !container.current.contains(e.target as Node)) {
        onClickAway()
      }
    }

    document.addEventListener("mousedown", handleClickAway)
    return () => {
      document.removeEventListener("mousedown", handleClickAway)
    }
  }, [container, enabled, onClickAway])
}

export default useClickAway
