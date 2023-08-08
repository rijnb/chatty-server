import {FC} from "react"

interface Props {
  text: string
  icon: JSX.Element
  onClick: () => void
}

export const SidebarButton: FC<Props> = ({text, icon, onClick}) => {
  return (
    <button
      className="flex w-full cursor-pointer select-none items-center gap-3 rounded-md px-3 py-3 text-[14px] leading-3 text-gray-800 transition-colors duration-200 hover:bg-gray-300 dark:text-white dark:hover:bg-[#343541]/90"
      onClick={onClick}
    >
      <div>{icon}</div>
      <span>{text}</span>
    </button>
  )
}

export default SidebarButton
