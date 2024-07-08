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

import {Dispatch, createContext} from "react"

import {PromptBarInitialState} from "./PromptBar.state"
import {ActionType} from "@/hooks/useCreateReducer"
import {SupportedFileFormats} from "@/types/import"
import {Prompt} from "@/types/prompt"

export interface PromptBarContextProps {
  state: PromptBarInitialState
  dispatch: Dispatch<ActionType<PromptBarInitialState>>
  handleCreatePrompt: () => void
  handleDeletePrompt: (prompt: Prompt) => void
  handleUpdatePrompt: (prompt: Prompt) => void
  handleClearPrompts: () => void
  handleImportPrompts: (data: SupportedFileFormats) => void
  handleExportPrompts: () => void
}

const PromptBarContext = createContext<PromptBarContextProps>(undefined!)

export default PromptBarContext
