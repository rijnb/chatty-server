import {IconLock} from "@tabler/icons-react"
import React from "react"
import {useUnlock} from "@/components/DoorLock/UnlockProvider"
import UnlockCode from "@/components/Settings/UnlockCode"


const UnlockOverlay = () => {
  const {unlocked, code, setCode, invalidCode} = useUnlock()

  console.log("UnlockOverlay: unlocked is", unlocked)

  return !unlocked ? (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border bg-white dark:bg-[#202123] px-4 pt-5 pb-4">
        <IconLock size={48} />
        <div className="text-2xl font-bold text-red-800 dark:text-red-400">
          The application is locked by an <span className="italic">unlock code</span>
        </div>
        {invalidCode && <div className="text-red-600 mt-4">The provided unlock code is invalid.</div>}
        <div className="text-center text-gray-300">Please enter the correct unlock code.</div>

        <UnlockCode unlockCode={code} onUnlockCodeChange={setCode} />
      </div>
    </div>
  ) : null
}

export default UnlockOverlay