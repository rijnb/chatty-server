import {IconRobot} from "@tabler/icons-react"

interface Props {}

export const ChatLoader = ({}: Props) => {
  return (
    <div
      className="group border-b border-black/10 bg-gray-50 text-gray-800 dark:border-gray-900/50 dark:bg-[#444654] dark:text-gray-100 md:px-4"
      style={{overflowWrap: "anywhere"}}
    >
      <div className="m-auto flex max-w-2xl gap-2 p-4 px-0 py-4 text-base">
        <div className="min-w-[40px] items-end">
          <IconRobot size={30} color="#44aa88" />
        </div>
        <span className="mt-1 animate-pulse cursor-default">▍</span>
      </div>
    </div>
  )
}

export default ChatLoader