import {useEffect, useState} from "react"

// Custom hook to manage waiting time
const useWaitTime = (initialWaitTime: number | null = null) => {
  const [waitTime, setWaitTime] = useState<number | null>(initialWaitTime)

  useEffect(() => {
    if (waitTime && waitTime > 0) {
      const timer = setTimeout(() => {
        const newWaitTime = waitTime - 1

        // reset waitTime to null when it reaches zero
        if (newWaitTime === 0) {
          setWaitTime(null)
        } else {
          setWaitTime(newWaitTime)
        }
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [waitTime])

  return {waitTime, setWaitTime}
}

export default useWaitTime
