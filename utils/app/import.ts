import {Conversation} from "@/types/chat"
import {ExportFormatV4, LatestExportFormat, SupportedExportFormats} from "@/types/export"
import {FolderInterface} from "@/types/folder"
import {Prompt} from "@/types/prompt"


export const isLatestExportFormat = isExportFormatV4

export function isExportFormatV4(obj: any): obj is ExportFormatV4 {
  return obj.version === 4
}

export const convertOldDataFormatToNew = (data: SupportedExportFormats): LatestExportFormat => {
  if (isExportFormatV4(data)) {
    return data
  }
  throw new Error("Unsupported data format version")
}

export const isValidFile = (json: any): string[] => {
  const errors = []
  if (!json || typeof json !== "object") {
    errors.push("Invalid JSON format, incorrect top-level structure")
    return errors
  }
  const {version, history, folders, prompts} = json
  if (
    typeof version !== "number" ||
    (history && !Array.isArray(history)) ||
    (folders && !Array.isArray(folders)) ||
    (prompts && !Array.isArray(prompts))
  ) {
    errors.push("Invalid file structure")
    return errors
  }
  if (history) {
    for (const historyItem of history) {
      if (
        !historyItem.id ||
        typeof historyItem.name !== "string" ||
        !Array.isArray(historyItem.messages) ||
        typeof historyItem.model !== "object" ||
        typeof historyItem.prompt !== "string" ||
        typeof historyItem.temperature !== "number"
      ) {
        errors.push("Invalid history item format")
        break
      }
      for (const message of historyItem.messages) {
        if (!message.role || typeof message.content !== "string") {
          errors.push("Invalid message format in history item")
          break
        }
      }
    }
  }
  return errors
}

export const importData = (data: SupportedExportFormats): LatestExportFormat => {
  const {history, folders, prompts} = convertOldDataFormatToNew(data)

  const oldConversations = localStorage.getItem("conversationHistory")
  const oldConversationsParsed = oldConversations ? JSON.parse(oldConversations) : []

  const newHistory: Conversation[] = [...oldConversationsParsed, ...history].filter(
    (conversation, index, self) => index === self.findIndex((c) => c.id === conversation.id)
  )
  localStorage.setItem("conversationHistory", JSON.stringify(newHistory))
  if (newHistory.length > 0) {
    localStorage.setItem("selectedConversation", JSON.stringify(newHistory[newHistory.length - 1]))
  } else {
    localStorage.removeItem("selectedConversation")
  }

  const oldFolders = localStorage.getItem("folders")
  const oldFoldersParsed = oldFolders ? JSON.parse(oldFolders) : []
  const newFolders: FolderInterface[] = [...folders, ...oldFoldersParsed].filter(
    (folder, index, self) => index === self.findIndex((otherFolder) => otherFolder.id === folder.id)
  )
  localStorage.setItem("folders", JSON.stringify(newFolders))

  const oldPrompts = localStorage.getItem("prompts")
  const oldPromptsParsed = oldPrompts ? JSON.parse(oldPrompts) : []
  const newPrompts: Prompt[] = [...prompts, ...oldPromptsParsed].filter(
    (prompt, index, self) => index === self.findIndex((p) => p.id === prompt.id)
  )
  localStorage.setItem("prompts", JSON.stringify(newPrompts))

  return {
    version: 4,
    history: newHistory,
    folders: newFolders,
    prompts: newPrompts
  }
}