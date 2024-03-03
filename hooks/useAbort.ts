import {useCallback, useEffect, useRef} from "react"

const useAbort = () => {
  const abortControllerRef = useRef(new AbortController())

  const abort = useCallback(() => {
    abortControllerRef.current.abort()
  }, [])

  const resetAbort = useCallback(() => {
    abortControllerRef.current = new AbortController()
  }, [])

  useEffect(() => {
    resetAbort()
    return abort // run abort function on unmount
  }, [abort])

  return {
    signal: abortControllerRef.current.signal,
    abort,
    resetAbort
  }
}

export default useAbort
