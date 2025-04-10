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
import {IconLock} from "@tabler/icons-react"
import React from "react"

import {UnlockCodeEditor} from "./UnlockCodeEditor"
import {useUnlock} from "./UnlockContext"
import {Dialog} from "@/components/Styled"

interface Props {}

export const UnlockOverlay = ({}: Props) => {
  const {unlocked, code, setCode, invalidCode} = useUnlock()

  return (
    !unlocked && (
      <Dialog>
        <div className="flex flex-col items-center gap-4">
          <IconLock size={48} />
          <div className="text-2xl font-bold text-red-800 dark:text-red-400">
            The application is locked by an <span className="italic">Unlock code.</span>
          </div>
          {invalidCode && (
            <div className="mt-4 text-red-600 dark:text-red-300">The provided unlock code is invalid.</div>
          )}
          <div className="text-gray-700 dark:text-gray-300">Please enter the correct unlock code:</div>

          <UnlockCodeEditor unlockCode={code} onUnlockCodeChange={setCode} />
        </div>
      </Dialog>
    )
  )
}
