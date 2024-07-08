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

import {Dispatch, createContext, useContext} from "react"

import {HomeInitialState} from "./home.state"
import {ActionType} from "@/hooks/useCreateReducer"
import {Conversation} from "@/types/chat"
import {KeyValuePair} from "@/types/data"
import {FolderType} from "@/types/folder"

export interface HomeContextProps {
  state: HomeInitialState
  dispatch: Dispatch<ActionType<HomeInitialState>>
  handleNewConversation: () => void
  handleCreateFolder: (name: string, type: FolderType) => void
  handleDeleteFolder: (folderId: string) => void
  handleUpdateFolder: (folderId: string, name: string) => void
  handleSelectConversation: (conversation: Conversation) => void
  handleUpdateConversation: (conversation: Conversation, data: KeyValuePair[]) => void
}

const HomeContext = createContext<HomeContextProps>(undefined!)

export const useHomeContext = () => {
  return useContext(HomeContext)
}

export default HomeContext
