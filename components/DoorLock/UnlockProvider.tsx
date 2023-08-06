import {createContext, useContext, useEffect, useState} from "react"

interface UnlockContextType {
  isProtected: boolean
  unlocked: boolean
  code: string
  setCode: (code: string) => void
}

const UnlockContext = createContext<UnlockContextType | undefined>(undefined)

export const useUnlock = () => {
  const context = useContext(UnlockContext)
  if (!context) {
    throw new Error("useUnlock must be used within UnlockProvider")
  }
  return context
}

interface UnlockProviderProps {
  isProtected: boolean
  children: React.ReactNode
}

export const UnlockProvider = ({isProtected, children}: UnlockProviderProps) => {
  const [code, setCode] = useState("")
  const [unlocked, setUnlocked] = useState(!isProtected)

  useEffect(() => {
    if (!isProtected) {
      setUnlocked(true)
    } else {
      const storedCode = localStorage.getItem("unlockCode")
      if (storedCode) {
        setCode(storedCode)
      }
    }
  }, [isProtected])

  useEffect(() => {
    if (code) {
      setUnlocked(true)
      localStorage.setItem("unlockCode", code)
    }
  }, [code, isProtected])

  const value: UnlockContextType = {
    isProtected,
    unlocked,
    code,
    setCode
  }

  return <UnlockContext.Provider value={value}>{children}</UnlockContext.Provider>
}
