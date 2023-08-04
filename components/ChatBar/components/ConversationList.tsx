import {Conversation} from "@/types/chat"
import {ConversationListItem} from "./ConversationListItem"

interface Props {
  conversations: Conversation[]
}

export const ConversationList = ({conversations}: Props) => {
  return (
    <div className="flex w-full flex-col gap-1">
      {conversations
        .filter((conversation) => !conversation.folderId)
        .slice()
        .reverse()
        .map((conversation, index) => (
          <ConversationListItem key={index} conversation={conversation} />
        ))}
    </div>
  )
}