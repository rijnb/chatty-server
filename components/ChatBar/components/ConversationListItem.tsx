import {IconCheck, IconMessage, IconPencil, IconTrash, IconX} from "@tabler/icons-react"
import {DragEvent, KeyboardEvent, MouseEventHandler, useContext, useEffect, useState} from "react"
import {isKeyboardEnter} from "@/utils/app/keyboard"
import {Conversation} from "@/types/chat"
import HomeContext from "@/pages/api/home/home.context"
import SidebarActionButton from "@/components/Buttons/SidebarActionButton"
import ChatBarContext from "@/components/ChatBar/ChatBar.context"


interface Props {
  conversation: Conversation
  isSelected: boolean
}

export const ConversationListItem = ({conversation, isSelected}: Props) => {
  const {
    state: {messageIsStreaming},
    handleSelectConversation,
    handleUpdateConversation
  } = useContext(HomeContext)

  const {handleDeleteConversation} = useContext(ChatBarContext)

  const [isDeleting, setIsDeleting] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState("")

  const handleEnterDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isKeyboardEnter(e)) {
      e.preventDefault()
      isSelected && handleRename(conversation)
    }
  }

  const handleDragStart = (e: DragEvent<HTMLButtonElement>, conversation: Conversation) => {
    if (e.dataTransfer) {
      e.dataTransfer.setData("conversation", JSON.stringify(conversation))
    }
  }

  const handleRename = (conversation: Conversation) => {
    if (renameValue.trim().length > 0) {
      handleUpdateConversation(conversation, {
        key: "name",
        value: renameValue
      })
      setRenameValue("")
      setIsRenaming(false)
    }
  }

  const handleConfirm: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation()
    if (isDeleting) {
      handleDeleteConversation(conversation)
    } else if (isRenaming) {
      handleRename(conversation)
    }
    setIsDeleting(false)
    setIsRenaming(false)
  }

  const handleCancel: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation()
    setIsDeleting(false)
    setIsRenaming(false)
  }

  const handleOpenRenameModal: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation()
    setIsRenaming(true)
    isSelected && setRenameValue(conversation.name)
  }
  const handleOpenDeleteModal: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation()
    setIsDeleting(true)
  }

  useEffect(() => {
    if (isRenaming) {
      setIsDeleting(false)
    } else if (isDeleting) {
      setIsRenaming(false)
    }
  }, [isRenaming, isDeleting])

  return (
    <div className="relative flex items-center">
      {isRenaming && isSelected ? (
        <div className="flex w-full items-center gap-3 rounded-lg bg-[#343541]/90 p-3">
          <IconMessage size={18} />
          <input
            className="mr-12 flex-1 overflow-hidden overflow-ellipsis dark:border-neutral-400 dark:bg-transparent dark:text-white text-gray-800 border-gray-300 bg-transparent text-left text-[12.5px] leading-3 outline-none focus:dark:border-neutral-100 focus:border-gray-500"
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={handleEnterDown}
            autoFocus
          />
        </div>
      ) : (
        <button
          className={`flex w-full cursor-pointer items-center gap-3 dark:hover:bg-[#343541]/90 hover:bg-gray-300 rounded-lg p-3 text-sm transition-colors duration-200 ${
            messageIsStreaming ? "disabled:cursor-not-allowed" : ""
          } ${isSelected ? "dark:bg-[#343541]/90 bg-gray-200" : ""}`}
          onClick={() => handleSelectConversation(conversation)}
          disabled={messageIsStreaming}
          draggable="true"
          onDragStart={(e) => handleDragStart(e, conversation)}
        >
          <IconMessage size={18} className="dark:text-white text-gray-800" />
          <div
            className={`relative max-h-8 flex-1 overflow-x-hidden text-ellipsis whitespace-nowrap break-all dark:text-white text-gray-800 text-left text-[12.5px] leading-4 ${
              isSelected ? "pr-12" : "pr-1"
            }`}
          >
            {conversation.name}
            {isSelected && (
              <div className="block dark:text-gray-400 text-gray-600 text-[12.5px]">
                {conversation?.time ? new Date(conversation?.time).toLocaleString() : ""}
              </div>
            )}
          </div>
        </button>
      )}

      {(isDeleting || isRenaming) && isSelected && (
        <div className="absolute right-1 z-10 flex dark:text-gray-300 text-gray-600">
          <SidebarActionButton handleClick={handleConfirm}>
            <IconCheck size={18} />
          </SidebarActionButton>
          <SidebarActionButton handleClick={handleCancel}>
            <IconX size={18} />
          </SidebarActionButton>
        </div>
      )}

      {isSelected && !isDeleting && !isRenaming && (
        <div className="absolute right-1 z-10 flex dark:text-gray-300 text-gray-600">
          <SidebarActionButton handleClick={handleOpenRenameModal}>
            <IconPencil size={18} />
          </SidebarActionButton>
          <SidebarActionButton handleClick={handleOpenDeleteModal}>
            <IconTrash size={18} />
          </SidebarActionButton>
        </div>
      )}
    </div>
  )
}

export default ConversationListItem
