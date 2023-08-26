import React, {useEffect, useRef} from "react"

import ChatLoader from "@/components/Chat/ChatLoader"
import ChatMenu from "@/components/Chat/ChatMenu"
import MemoizedChatMessage from "@/components/Chat/MemoizedChatMessage"
import ReleaseNotes from "@/components/Chat/ReleaseNotes"
import ScrollDownButton from "@/components/Chat/ScrollDownButton"
import useScroll from "@/components/Hooks/useScroll"
import useReleaseNotes from "@/hooks/useReleaseNotes"
import {useHomeContext} from "@/pages/api/home/home.context"
import {Conversation, Message} from "@/types/chat"
import {updateConversationHistory} from "@/utils/app/conversations"

interface Props {
  selectedConversation: Conversation
  //todo should discard messages here and not in Chat.tsx
  onSend: (message: Message, index: number) => void
}

const ChatConversation = ({selectedConversation, onSend}: Props) => {
  const {
    state: {conversations, models, loading, messageIsStreaming},
    dispatch: homeDispatch
  } = useHomeContext()

  const chatContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {showScrollDownButton, handleScroll, jumpToBottom} = useScroll(chatContainerRef)
  const {isReleaseNotesDialogOpen, closeReleaseNotes, openReleaseNotes} = useReleaseNotes()

  useEffect(() => {
    jumpToBottom()
  }, [jumpToBottom, selectedConversation])

  const handleDeleteMessage = (messageIndex: number) => {
    if (!selectedConversation) {
      return
    }

    const {messages} = selectedConversation

    if (messages[messageIndex].role === "assistant") {
      messages.splice(messageIndex, 1)
    } else {
      if (messageIndex < messages.length - 1 && messages[messageIndex + 1].role === "assistant") {
        messages.splice(messageIndex, 2)
      } else {
        messages.splice(messageIndex, 1)
      }
    }

    const updatedConversation = {
      ...selectedConversation,
      messages
    }

    const conversationHistory = updateConversationHistory(updatedConversation, conversations)
    homeDispatch({field: "selectedConversation", value: updatedConversation})
    homeDispatch({field: "conversations", value: conversationHistory})
  }

  return (
    <div className="max-h-full overflow-x-hidden" ref={chatContainerRef} onScroll={handleScroll}>
      <ChatMenu
        conversation={selectedConversation}
        models={models}
        container={chatContainerRef}
        onOpenReleaseNotes={openReleaseNotes}
      />
      <div className="h-[37px] bg-white dark:bg-[#343541]" ref={messagesEndRef} />
      {selectedConversation?.messages.map((message, index) => (
        <MemoizedChatMessage
          key={index}
          message={message}
          isComplete={index < (selectedConversation?.messages.length ?? 0) - 1 || !messageIsStreaming}
          onDelete={() => handleDeleteMessage(index)}
          onEdit={(editedMessage) => {
            // Discard edited message and the ones that come after then resend.
            onSend(editedMessage, index)
          }}
        />
      ))}
      {loading && <ChatLoader />}

      {showScrollDownButton && (
        <div className="absolute bottom-[180px] right-10">
          <ScrollDownButton container={chatContainerRef} />
        </div>
      )}
      <div className="h-[162px] bg-white dark:bg-[#343541]" ref={messagesEndRef} />
      {isReleaseNotesDialogOpen && <ReleaseNotes close={closeReleaseNotes} />}
    </div>
  )
}

export default ChatConversation
