/*
 * Copyright (C) 2024, Rijn Buve.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions
 * of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import {useEffect, useState} from "react"

import {UnlockContext, UnlockContextType} from "./UnlockContext"
import {UnlockOverlay} from "./UnlockOverlay"
import {getUnlockCode, removeUnlockCode, saveUnlockCode} from "@/utils/app/settings"

interface Props {
  isProtected: boolean
  children: React.ReactNode
}

export const UnlockProvider = ({isProtected, children}: Props) => {
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

  return (
    <UnlockContext.Provider value={value}>
      {children}
      <UnlockOverlay />
    </UnlockContext.Provider>
  )
}
