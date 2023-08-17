import SidebarButton from "@/components/Sidebar/SidebarButton"
import {IconCheck, IconTrash, IconX} from "@tabler/icons-react"
import {useTranslation} from "next-i18next"
import {useState} from "react"

interface Props {
  onClearPrompts: () => void
}

export const ClearPrompts = ({onClearPrompts}: Props) => {
  const [isConfirming, setIsConfirming] = useState<boolean>(false)

  const {t} = useTranslation("common")

  const handleClearPrompts = () => {
    onClearPrompts()
    setIsConfirming(false)
  }

  return isConfirming ? (
      <div
          className="flex w-full cursor-pointer items-center rounded-lg px-3 py-3 text-gray-800 hover:bg-gray-300 dark:text-white dark:hover:bg-[#343541]/90">
        <IconTrash size={18}/>

        <div className="ml-3 flex-1 text-left text-[12.5px] leading-3 text-gray-800 dark:text-white">
          {t("Are you sure?")}
        </div>

        <div className="flex w-[40px]">
          <IconCheck
              className="ml-auto mr-1 min-w-[20px] text-gray-500 hover:text-gray-700 dark:text-neutral-300 dark:hover:text-neutral-100"
              size={18}
              onClick={(e) => {
                e.stopPropagation()
                handleClearPrompts()
              }}
          />

          <IconX
              className="ml-auto min-w-[20px] text-gray-500 hover:text-gray-700 dark:text-neutral-300 dark:hover:text-neutral-100"
              size={18}
              onClick={(e) => {
                e.stopPropagation()
                setIsConfirming(false)
              }}
          />
        </div>
      </div>
  ) : (
      <SidebarButton
          text={t("Reset to factory prompts")}
          icon={<IconTrash size={18}/>}
          onClick={() => setIsConfirming(true)}
      />
  )
}

export default ClearPrompts
