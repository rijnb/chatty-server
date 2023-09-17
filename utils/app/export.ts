import {FolderType} from "@/types/folder"
import {ConversationV5, FileFormatV5, FolderInterfaceV4, PromptV5} from "@/types/import"
import {getConversationsHistory} from "@/utils/app/conversations"
import {generateFilename} from "@/utils/app/filename"
import {getFolders} from "@/utils/app/folders"
import {getPrompts} from "@/utils/app/prompts"

export const exportData = (prefix: string, type: FolderType) => {
  let conversationsToExport: ConversationV5[] = getConversationsHistory().map((conversation) => {
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
  const data: FileFormatV5 = {
    version: 5,
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
  } as FileFormatV5

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
