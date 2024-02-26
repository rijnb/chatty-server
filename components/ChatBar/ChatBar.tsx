import {useTranslation} from "next-i18next"
import {useCallback, useEffect} from "react"

import Sidebar from "../Sidebar"
import ChatBarContext from "./ChatBar.context"
import {ChatBarInitialState, initialState} from "./ChatBar.state"
import ChatBarSettings from "./components/ChatBarSettings"
import ChatFolderList from "./components/ChatFolderList"
import ConversationList from "./components/ConversationList"
import useConversationsOperations from "@/components/Conversation/useConversationsOperations"
import useFoldersOperations from "@/components/Folder/useFoldersOperations"
import {useCreateReducer} from "@/hooks/useCreateReducer"
import {useHomeContext} from "@/pages/api/home/home.context"
import {Conversation} from "@/types/chat"
import {saveApiKey, saveShowChatBar} from "@/utils/app/settings"
import {saveToolConfigurations} from "@/utils/app/tools"

export const ChatBar = () => {
  const {t} = useTranslation("common")
  const chatBarContextValue = useCreateReducer<ChatBarInitialState>({initialState})

  const {
    state: {showChatBar, toolConfigurations},
    dispatch: homeDispatch
  } = useHomeContext()

  const {selectedConversation, conversations, updateConversation, createConversation} = useConversationsOperations()

  const {createFolder} = useFoldersOperations()

  const {
    state: {searchTerm, filteredConversations},
    dispatch: chatDispatch
  } = chatBarContextValue

  const handleApiKeyChange = useCallback(
    (apiKey: string) => {
      homeDispatch({field: "apiKey", value: apiKey})
      saveApiKey(apiKey)
    },
    [homeDispatch]
  )

  const handleToolConfigurationChange = (toolId: string, configuration: any) => {
    const updatedToolConfigurations = {...toolConfigurations, [toolId]: configuration}
    homeDispatch({field: "toolConfigurations", value: updatedToolConfigurations})
    saveToolConfigurations(updatedToolConfigurations)
  }

  const handleClearToolConfiguration = (toolId: string) => {
    const updatedToolConfigurations = {...toolConfigurations}
    delete updatedToolConfigurations[toolId]
    homeDispatch({field: "toolConfigurations", value: updatedToolConfigurations})
    saveToolConfigurations(updatedToolConfigurations)
  }

  const handleToggleChatBar = () => {
    homeDispatch({field: "showChatBar", value: !showChatBar})
    saveShowChatBar(!showChatBar)
  }

  const handleDrop = (e: any) => {
    if (e.dataTransfer) {
      const data = e.dataTransfer.getData("conversation")
      if (data) {
        const conversation = JSON.parse(data)
        updateConversation(conversation, {key: "folderId", value: 0})
      }
      chatDispatch({field: "searchTerm", value: ""})
      e.target.style.background = "none"
    }
  }

  useEffect(() => {
    if (searchTerm) {
      chatDispatch({
        field: "filteredConversations",
        value: conversations.filter((conversation) => {
          const searchable =
            conversation.name.toLocaleLowerCase() +
            " " +
            conversation.messages.map((message) => message.content).join(" ")
          return searchable.toLowerCase().includes(searchTerm.toLowerCase())
        })
      })
    } else {
      chatDispatch({
        field: "filteredConversations",
        value: conversations
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, conversations])

  return (
    <ChatBarContext.Provider
      value={{
        ...chatBarContextValue,
        handleToolConfigurationChange,
        handleClearToolConfiguration,
        handleApiKeyChange
      }}
    >
      <Sidebar<Conversation>
        side={"left"}
        isOpen={showChatBar}
        addItemButtonTitle={t("Conversation")}
        listItem={
          <ConversationList conversations={filteredConversations} selectedConversation={selectedConversation} />
        }
        folderListItem={<ChatFolderList searchTerm={searchTerm} />}
        items={filteredConversations}
        searchTerm={searchTerm}
        handleSearchTerm={(searchTerm: string) => chatDispatch({field: "searchTerm", value: searchTerm})}
        toggleOpen={handleToggleChatBar}
        handleCreateItem={createConversation}
        handleCreateFolder={() => createFolder(t("New folder"), "chat")}
        handleDrop={handleDrop}
        footerComponent={<ChatBarSettings />}
      />
    </ChatBarContext.Provider>
  )
}

export default ChatBar
