import { createContext, useContext, useEffect, useState } from "react";
import { getUnlockCode, removeUnlockCode, saveUnlockCode } from "@/utils/app/settings";
import { UnlockOverlay } from "@/components/UnlockCode/UnlockOverlay";


interface UnlockContextType {
  isProtected: boolean
  unlocked: boolean
  code: string
  setCode: (code: string) => void
  invalidCode: boolean
  setInvalidCode: (invalid: boolean) => void
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
  const [loading, setLoading] = useState(isProtected)

  const [code, setCode] = useState("")
  const [unlocked, setUnlocked] = useState(!isProtected)
  const [invalidCode, setInvalidCode] = useState(false)

  useEffect(() => {
    getUnlockCode()
  }, [])

  useEffect(() => {
    if (isProtected) {
      const storedCode = getUnlockCode()
      if (storedCode) {
        setCode(storedCode)
        setUnlocked(true)
      }

      setLoading(false)
    } else {
      setUnlocked(true)
      removeUnlockCode()
    }
  }, [isProtected])

  useEffect(() => {
    if (code) {
      setUnlocked(true)
      setInvalidCode(false)
      saveUnlockCode(code)
    }
  }, [code, isProtected])

  useEffect(() => {
    if (invalidCode) {
      setUnlocked(false)
    }
  }, [invalidCode])

  const value: UnlockContextType = {
    isProtected,
    unlocked,
    code,
    setCode,
    invalidCode,
    setInvalidCode
  }

  if (loading) {
    return null
  }

  {
    return (
      <UnlockContext.Provider value={value}>
        {children}
        <UnlockOverlay />
      </UnlockContext.Provider>
    )
  }
}