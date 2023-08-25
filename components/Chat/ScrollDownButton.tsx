import {IconArrowDown} from "@tabler/icons-react"
import React from "react"

interface Props {
  container: any
}

const ScrollDownButton = ({container}: Props) => {
  const handleScrollToBottom = () => {
    container.current?.scrollTo({
      top: container.current.scrollHeight,
      behavior: "smooth"
    })
  }

  return (
    <button
      className="flex h-7 w-7 items-center justify-center  rounded-full bg-neutral-300 text-gray-800 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 dark:bg-gray-700 dark:text-neutral-200 dark:focus:ring-gray-500"
      onClick={handleScrollToBottom}
    >
      <IconArrowDown size={18} />
    </button>
  )
}

export default ScrollDownButton
