import {memo} from "react"

import ChatMessage from "./ChatMessage"

const MemoizedChatMessage = memo(
  ChatMessage,
  (prevProps, nextProps) =>
    prevProps.message.content == nextProps.message.content && prevProps.isComplete == nextProps.isComplete
)

MemoizedChatMessage.displayName = "MemoizedChatMessage"
export default MemoizedChatMessage
