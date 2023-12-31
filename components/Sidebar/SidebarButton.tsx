import React from "react"

interface Props {
  text: string
  icon: React.JSX.Element
  onClick: () => void
}

export const SidebarButton = ({text, icon, onClick}: Props) => {
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
