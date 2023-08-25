import {useTranslation} from "next-i18next"
import React, {useEffect, useRef, useState} from "react"

import ChatHeader from "@/components/Chat/ChatHeader"
import ChatMessage from "@/components/Chat/ChatMessage"
import ScrollDownButton from "@/components/Chat/ScrollDownButton"
import useScroll from "@/components/Hooks/useScroll"
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
    state: {conversations},
    dispatch: homeDispatch
  } = useHomeContext()

  const chatContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {showScrollDownButton, handleScroll, jumpToBottom} = useScroll(chatContainerRef)

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
      <ChatHeader conversation={selectedConversation} chatContainerRef={chatContainerRef} />
      {selectedConversation?.messages.map((message, index) => (
        <ChatMessage
          key={index}
          conversation={selectedConversation}
          message={message}
          messageIndex={index}
          onDeleteMessage={() => handleDeleteMessage(index)}
          onEdit={(editedMessage) => {
            // Discard edited message and the ones that come after then resend.
            onSend(editedMessage, index)
          }}
        />
      ))}

      {showScrollDownButton && (
        <div className="absolute bottom-[180px] right-10">
          <ScrollDownButton container={chatContainerRef} />
        </div>
      )}
      <div className="h-[162px] bg-white dark:bg-[#343541]" ref={messagesEndRef} />
    </div>
  )
}

export default ChatConversation
