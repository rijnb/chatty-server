import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconLayoutSidebarRightCollapse,
  IconLayoutSidebarRightExpand
} from "@tabler/icons-react"

interface Props {
  onClick: any
  isOpen: boolean
  side: "left" | "right"
}

export const OpenCloseSidebarButton = ({onClick, isOpen, side}: Props) => {
  const withoutBorder = " flex flex-shrink-0 cursor-pointer items-center gap-3 text-sm text-gray-800 transition-colors duration-200 hover:bg-gray-200/10 dark:border-gray-600/20 dark:text-white dark:hover:bg-gray-700/10"
  const withBorder = withoutBorder + " gap-3 rounded-md border border-gray-300 p-3"
  const spaceLeft = "ml-2" + withBorder
  const noSpaceLeft = "ml-0" + withBorder
  return isOpen ?
      side === "right" ? (
          <button className={spaceLeft} onClick={onClick} title="Collapse sidebar">
            <IconLayoutSidebarRightCollapse size={18}/>
          </button>
      ) : (
          <button className={noSpaceLeft} onClick={onClick} title="Collapse sidebar">
            <IconLayoutSidebarLeftCollapse size={18}/>
          </button>
      ) : side === "right" ? (
          <button className={withoutBorder} onClick={onClick} title="Expand sidebar">
            <IconLayoutSidebarRightExpand size={18}/>
          </button>
      ) : (
          <button className={withoutBorder} onClick={onClick} title="Expand sidebar">
            <IconLayoutSidebarLeftExpand size={18}/>
          </button>
      )
}

export default OpenCloseSidebarButton
