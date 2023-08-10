import {IconArrowBarLeft, IconArrowBarRight} from "@tabler/icons-react"

interface Props {
  onClick: any
  side: "left" | "right"
}

export const CloseSidebarButton = ({onClick, side}: Props) => {
  return (
    <button
      className={`absolute top-0.5 ${
        side === "right" ? "right-[270px]" : "left-[270px]"
      } z-50 h-8 w-8 text-neutral-700 hover:text-gray-400 dark:text-white dark:hover:text-gray-300`}
      onClick={onClick}
    >
      {side === "right" ? <IconArrowBarRight /> : <IconArrowBarLeft />}
    </button>
  )
}

export const OpenSidebarButton = ({onClick, side}: Props) => {
  return (
    <button
      className={`absolute top-0.5 ${
        side === "right" ? "right-2" : "left-2"
      } z-50 h-8 w-8 text-neutral-700 hover:text-gray-400 dark:text-white dark:hover:text-gray-300`}
      onClick={onClick}
    >
      {side === "right" ? <IconArrowBarLeft /> : <IconArrowBarRight />}
    </button>
  )
}
