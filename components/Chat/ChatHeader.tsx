import {IconBulbFilled, IconBulbOff, IconHelp, IconMarkdown, IconRobot, IconScreenshot} from "@tabler/icons-react"
import {useTranslation} from "next-i18next"
import {useTheme} from "next-themes"
import React from "react"

import useSaveMarkdown from "@/components/Hooks/useSaveMarkdown"
import useScreenshot from "@/components/Hooks/useScreenshot"
import {Conversation} from "@/types/chat"

interface Props {
  conversation: Conversation
  chatContainerRef: React.RefObject<HTMLDivElement>
}
const ChatHeader = ({conversation, chatContainerRef}: Props) => {
  const {t} = useTranslation("common")
  const {theme, setTheme} = useTheme()

  const {onSaveScreenshot} = useScreenshot(chatContainerRef)
  const {onSaveMarkdown} = useSaveMarkdown(conversation)

  //TODO implement release notes
  const handleToggleReleaseNotes = () => {}
  //TODO implement settings
  const handleToggleSettings = () => {}

  return (
    <header className="sticky top-0 z-10 flex min-w-[768px] justify-center border border-b-neutral-300 bg-neutral-100 py-2 text-sm text-neutral-500 dark:border-none dark:bg-[#444654] dark:text-neutral-200">
      {t("Model")}: {conversation?.modelId ?? "(none)"}
      &nbsp;&nbsp;&nbsp;|&nbsp;
      <button className="ml-2 cursor-pointer hover:opacity-50" onClick={handleToggleReleaseNotes}>
        <IconHelp size={18} />
      </button>
      &nbsp;&nbsp;&nbsp;|&nbsp;
      <button
        className="ml-2 cursor-pointer hover:opacity-50"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {theme === "dark" ? <IconBulbFilled size={18} /> : <IconBulbOff size={18} />}
      </button>
      <button className="ml-2 cursor-pointer hover:opacity-50" onClick={handleToggleSettings}>
        <IconRobot size={18} />
      </button>
      &nbsp;&nbsp;&nbsp;|&nbsp;
      {conversation ? (
        <button className="ml-2 cursor-pointer hover:opacity-50" onClick={onSaveScreenshot}>
          <IconScreenshot size={18} />
        </button>
      ) : null}
      {conversation ? (
        <button className="ml-2 cursor-pointer hover:opacity-50" onClick={onSaveMarkdown}>
          <IconMarkdown size={18} />
        </button>
      ) : null}
    </header>
  )
}

export default ChatHeader
