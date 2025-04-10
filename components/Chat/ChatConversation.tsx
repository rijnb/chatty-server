/*
 * Copyright (C) 2024, Rijn Buve.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions
 * of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import React, {useEffect, useRef} from "react"

import ChatLoader from "@/components/Chat/ChatLoader"
import ChatMenu from "@/components/Chat/ChatMenu"
import ChatMessage from "@/components/Chat/ChatMessage"
import ReleaseNotes from "@/components/Chat/ReleaseNotes"
import ScrollDownButton from "@/components/Chat/ScrollDownButton"
import useScroll from "@/components/Hooks/useScroll"
import useReleaseNotes from "@/hooks/useReleaseNotes"
import {useHomeContext} from "@/pages/api/home/home.context"
import {Conversation, Message} from "@/types/chat"
import {updateConversationHistory} from "@/utils/app/conversations"

interface Props {
  conversation: Conversation
  onSend: (message: Message, index: number) => void
}

const ChatConversation = ({conversation, onSend}: Props) => {
  const {
    state: {conversations, models, loading, messageIsStreaming},
    dispatch: homeDispatch
  } = useHomeContext()

  const chatContainerRef = useRef<HTMLDivElement>(null)

  const {showScrollDownButton, handleScroll, jumpToBottom, autoscroll} = useScroll(chatContainerRef)
  const {isReleaseNotesDialogOpen, closeReleaseNotes, openReleaseNotes} = useReleaseNotes()

  useEffect(() => {
    jumpToBottom()
  }, [jumpToBottom, conversation.id])

  useEffect(() => {
    autoscroll()
  }, [autoscroll, conversation])

  const handleDeleteMessage = (messageIndex: number) => {
    if (!conversation) {
      return
    }

    const {messages} = conversation

    if (messages[messageIndex].role === "assistant") {
      messages.splice(messageIndex, 1)
    } else if (messageIndex < messages.length - 1 && messages[messageIndex + 1].role === "assistant") {
      messages.splice(messageIndex, 2)
    } else {
      messages.splice(messageIndex, 1)
    }

    // Replace messages in conversation.
    const updatedConversation = {...conversation, messages}
    homeDispatch({field: "selectedConversation", value: updatedConversation})

    // Set the current message to the last 'user' message.
    const currentMessage =
      messages.length > 0
        ? messages.reduce((lastUserMessage, message) => {
            return message.role === "user" ? message : lastUserMessage
          })
        : undefined
    homeDispatch({field: "currentMessage", value: currentMessage})

    // Replace conversation in history.
    const conversationHistory = updateConversationHistory(conversations, updatedConversation)
    homeDispatch({field: "conversations", value: conversationHistory})
  }

  const handleEditMessage = (editedMessage: Message, index: number) => {
    // Discard edited message and the ones that come after then resend.
    onSend(editedMessage, index)
  }

  return (
    <div className="max-h-full overflow-x-hidden" ref={chatContainerRef} onScroll={handleScroll}>
      <ChatMenu
        conversation={conversation}
        models={models}
        container={chatContainerRef}
        onOpenReleaseNotes={openReleaseNotes}
        onUpdateConversation={(conversation) => {
          const conversationHistory = updateConversationHistory(conversations, conversation)
          homeDispatch({field: "selectedConversation", value: conversation})
          homeDispatch({field: "conversations", value: conversationHistory})
        }}
      />
      <div className="h-[37px] bg-white dark:bg-[#343541]" />
      {conversation?.messages.map((message, index) => (
        <ChatMessage
          key={index}
          message={message}
          isComplete={index < (conversation?.messages.length ?? 0) - 1 || !messageIsStreaming}
          onDelete={() => handleDeleteMessage(index)}
          onEdit={(editedMessage) => handleEditMessage(editedMessage, index)}
        />
      ))}
      {loading && <ChatLoader />}

      {showScrollDownButton && (
        <div className="absolute bottom-[180px] right-10">
          <ScrollDownButton container={chatContainerRef} />
        </div>
      )}
      <div className="h-[162px] bg-white dark:bg-[#343541]" />
      {isReleaseNotesDialogOpen && <ReleaseNotes close={closeReleaseNotes} />}
    </div>
  )
}

export default ChatConversation
