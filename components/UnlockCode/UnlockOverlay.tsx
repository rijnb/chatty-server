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
