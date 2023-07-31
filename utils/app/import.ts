import {
  getConversationsHistory,
  removeSelectedConversation,
  saveConversationsHistory,
  saveSelectedConversation
} from "@/utils/app/conversations"
import {getFolders, saveFolders} from "@/utils/app/folders"
import {trimForPrivacy} from "@/utils/app/privacy"
import {getPrompts, savePrompts} from "@/utils/app/prompts"
import {Conversation} from "@/types/chat"
import {FileFormatV4, LatestFileFormat, SupportedFileFormats} from "@/types/export"
import {FolderInterface} from "@/types/folder"
import {Prompt} from "@/types/prompt"


export const isLatestJsonFormat = isJsonFormatV4

export function isJsonFormatV4(obj: any): obj is FileFormatV4 {
  return obj.version === 4
}

export const upgradeDataToLatestJsonFormat = (data: SupportedFileFormats): LatestFileFormat => {
  if (isJsonFormatV4(data)) {
    return data
  }
  throw new Error(`Unsupported data file format version: ${trimForPrivacy(JSON.stringify(data))}`)
}

export const isValidJsonData = (json: any): string[] => {
  const errors = []
  if (!json || typeof json !== "object") {
    errors.push("Invalid JSON format, incorrect top-level structure, expected an object")
    return errors
  }
  const {version, history, folders, prompts} = json
  if (
    typeof version !== "number" ||
    (history && !Array.isArray(history)) ||
    (folders && !Array.isArray(folders)) ||
    (prompts && !Array.isArray(prompts))
  ) {
    errors.push("Invalid file structure, expected version, history, folders and prompts keys")
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
        errors.push("Invalid history item format, expected id, name, messages, model, prompt and temperature keys")
        break
      }
      for (const message of historyItem.messages) {
        if (!message.role || typeof message.content !== "string") {
          errors.push("Invalid message format in history item, expected role and content keys")
          break
        }
      }
    }
  }
  return errors
}

export const importJsonData = (data: SupportedFileFormats): LatestFileFormat => {
  const {history, folders, prompts} = upgradeDataToLatestJsonFormat(data)
  const existingConversationHistory = getConversationsHistory()

  // Existing conversations are NOT overwritten.
  const conversationHistory: Conversation[] = [...existingConversationHistory, ...history].filter(
    (conversation, index, self) => index === self.findIndex((other) => other.id === conversation.id)
  )
  saveConversationsHistory(conversationHistory)
  if (conversationHistory.length > 0) {
    saveSelectedConversation(conversationHistory[conversationHistory.length - 1])
  } else {
    removeSelectedConversation()
  }

  // Existing folders are NOT overwritten.
  const existingFolders = getFolders()
  const importedFolders: FolderInterface[] = [...existingFolders, ...folders].filter(
    (folder, index, self) => index === self.findIndex((other) => other.id === folder.id)
  )
  saveFolders(importedFolders)

  // Existing prompts are overwritten.
  const existingPrompts = getPrompts()
  const importedPrompts: Prompt[] = [...prompts, ...existingPrompts].filter(
    (prompt, index, self) => index === self.findIndex((other) => other.id === prompt.id)
  )
  savePrompts(importedPrompts)

  return {
    version: 4,
    history: conversationHistory,
    folders: importedFolders,
    prompts: importedPrompts
  }
}