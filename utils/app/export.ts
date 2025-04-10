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
import {FolderType} from "@/types/folder"
import {ConversationV7, FileFormatV7, FolderInterfaceV4, PromptV5} from "@/types/import"
import {getConversationsHistory} from "@/utils/app/conversations"
import {generateFilename} from "@/utils/app/filename"
import {getFolders} from "@/utils/app/folders"
import {getPrompts} from "@/utils/app/prompts"

export const exportData = (prefix: string, type: FolderType) => {
  let conversationsToExport: ConversationV7[] = getConversationsHistory().map((conversation) => {
    const {modelId, ...rest} = conversation
    return {modelId: modelId, ...rest}
  })

  let promptsToExport: PromptV5[] = getPrompts().map((prompt) => {
    return prompt as PromptV5
  })

  let foldersToExport: FolderInterfaceV4[] = getFolders().filter(
    (folder) => folder.type === type
  ) as FolderInterfaceV4[]

  /**
   * Create body of file.
   */
  const data: FileFormatV7 = {
    version: 7,
    history: type === "chat" ? conversationsToExport : [],
    prompts:
      type == "prompt"
        ? promptsToExport.map((prompt, index, all) => {
            if (prompt.folderId) {
              return prompt
            } else {
              const {folderId, ...rest} = prompt
              return rest
            }
          })
        : [],
    folders: foldersToExport
  } as FileFormatV7

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.download = generateFilename(prefix, "json")

  link.href = url
  link.style.display = "none"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
