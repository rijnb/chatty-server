import ConversationListItem from "./ConversationListItem"
import {Conversation} from "@/types/chat"

interface Props {
  conversations: Conversation[]
  selectedConversation?: Conversation
}

export const ConversationList = ({conversations, selectedConversation}: Props) => {
  return (
    <div className="flex w-full flex-col gap-1">
      {conversations
        .filter((conversation) => !conversation.folderId)
        .slice()
        .reverse()
        .map((conversation, index) => (
          <ConversationListItem
            key={index}
            conversation={conversation}
            isSelected={conversation.id == selectedConversation?.id}
          />
        ))}
    </div>
  )
}

export default ConversationList
