import {IconCheck, IconKey, IconX} from "@tabler/icons-react"
import {KeyboardEvent, useEffect, useRef, useState} from "react"
import {useTranslation} from "next-i18next"
import {isKeyboardEnter} from "@/utils/app/keyboard"
import SidebarButton from "../Sidebar/SidebarButton"

interface Props {
  unlockCode: string
  onUnlockCodeChange: (apiKey: string) => void
}

export const UnlockCodeEditor = ({unlockCode, onUnlockCodeChange}: Props) => {
  const {t} = useTranslation("sidebar")
  const [isChanging, setIsChanging] = useState(false)
  const [newUnlockCode, setNewUnlockCode] = useState(unlockCode)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setNewUnlockCode(unlockCode)
  }, [unlockCode])

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isKeyboardEnter(e)) {
      e.preventDefault()
      handleUpdateKey(newUnlockCode)
    }
  }

  const handleUpdateKey = (newKey: string) => {
    onUnlockCodeChange(newKey.trim())
    setIsChanging(false)
  }

  useEffect(() => {
    if (isChanging) {
      inputRef.current?.focus()
    }
  }, [isChanging])

  return isChanging ? (
    <div className="duration:200 flex w-full cursor-pointer items-center rounded-md px-3 py-3 transition-colors hover:bg-gray-300 dark:hover:bg-[#343541]/90">
      <IconKey size={18} />

      <input
        ref={inputRef}
        className="ml-2 h-[20px] flex-1 overflow-hidden overflow-ellipsis border-b border-gray-300 bg-transparent pr-1 text-left text-[12.5px] leading-3 text-gray-800 outline-none focus:border-gray-500 dark:border-neutral-600 dark:text-white focus:dark:border-neutral-200"
        type="password"
        value={newUnlockCode}
        onChange={(e) => setNewUnlockCode(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t("Enter unlock code")}
      />

      <div className="flex w-[40px]">
        <IconCheck
          className="ml-auto min-w-[20px] text-gray-500 hover:text-gray-700 dark:text-neutral-300 dark:hover:text-neutral-100"
          size={18}
          onClick={(e) => {
            e.stopPropagation()
            handleUpdateKey(newUnlockCode)
          }}
        />

        <IconX
          className="ml-auto min-w-[20px] text-gray-500 hover:text-gray-700 dark:text-neutral-300 dark:hover:text-neutral-100"
          size={18}
          onClick={(e) => {
            e.stopPropagation()
            setIsChanging(false)
            setNewUnlockCode(unlockCode)
          }}
        />
      </div>
    </div>
  ) : (
    <SidebarButton text={t("Unlock code")} icon={<IconKey size={18} />} onClick={() => setIsChanging(true)} />
  )
}
