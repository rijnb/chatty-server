import {createContext, useContext} from "react"

export interface UnlockContextType {
  isProtected: boolean
  unlocked: boolean
  code: string
  setCode: (code: string) => void
  invalidCode: boolean
  setInvalidCode: (invalid: boolean) => void
}

export const UnlockContext = createContext<UnlockContextType | undefined>(undefined)

export const useUnlock = () => {
  const context = useContext(UnlockContext)
  if (!context) {
    throw new Error("useUnlock must be used within UnlockProvider")
  }
  return context
}
