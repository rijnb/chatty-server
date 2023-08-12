import {getConversationsHistory, removeSelectedConversation, saveConversationsHistory, saveSelectedConversation} from "@/utils/app/conversations"
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

export const upgradeDataToLatestFormat = (data: SupportedFileFormats): LatestFileFormat => {
  if (isJsonFormatV4(data)) {
    return data
  }
  throw new Error(`Unsupported data file format version: ${trimForPrivacy(JSON.stringify(data))}`)
}

export const isValidJsonData = (jsonData: any): string[] => {
  const errors = []
  if (!jsonData || typeof jsonData !== "object") {
    errors.push("Invalid JSON format; incorrect top-level structure, expected an object")
    return errors
  }
  const {version, history, folders, prompts} = jsonData
  if (
      typeof version !== "number" ||
      (history && !Array.isArray(history)) ||
      (folders && !Array.isArray(folders)) ||
      (prompts && !Array.isArray(prompts))
  ) {
    errors.push("Invalid file structure; expected version, history, folders and prompts keys")
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
        errors.push("Invalid history item format; expected id, name, messages, model, prompt and temperature keys")
        break
      }
      for (const message of historyItem.messages) {
        if (!message.role || typeof message.content !== "string") {
          errors.push("Invalid message format in history item; expected role and content keys")
          break
        }
      }
    }
  }
  return errors
}

// Import file and set the 'factory' value for all prompts to a new value (or remove it).
export const importData = (
    data: SupportedFileFormats,           // Contents of data file.
    readFactoryData: boolean = false
): LatestFileFormat => {

  // Read history, folders and prompts file JSON file data.
  const {history: readHistory, folders: readFolders, prompts: readPrompts} = upgradeDataToLatestFormat(data)

  // Extract:
  //   existing user folder     - current non-factory folders
  //   existing factory folder  - current factory folders
  //   new factory folders      - only read when readFactoryData is true
  //                              all folders are marked as factory in that case
  //   new user folders         - only read when readFactoryData is false
  //                              only non-factory folders that have a non-factory folder id
  const newFactoryFolders = readFactoryData ? readFolders.map((folder) => {
    folder.factory = true
    return folder
  }) : []
  const newFactoryFolderIds = newFactoryFolders.map((folder) => folder.id)
  const existingUserFolders = getFolders().filter((folder) => !folder.factory)
  const existingFactoryFolders = getFolders().filter((folder) => folder.factory && !newFactoryFolderIds.includes(folder.id))
  const existingFactoryFolderIds = existingFactoryFolders.map((folder) => folder.id)
  const allFactoryFolderIds = [...existingFactoryFolderIds, ...newFactoryFolderIds]
  const newUserFolders = readFolders
      .filter((folder) => !folder.factory && !allFactoryFolderIds.includes(folder.id))
      .map((folder) => {
        folder.factory = false
        return folder
      }) ?? []

  // Extract:
  //   existing user prompts    - current non-factory prompts
  //   existing factory prompts - current factory prompts
  //   new factory prompts      - only read when readFactoryData is true
  //                              all prompts are marked as factory in that case
  //   new user prompts         - only read when readFactoryData is false
  //                              only non-factory prompts that have a non-factory prompts id
  const newFactoryPrompts = readFactoryData ? readPrompts.map((prompt) => {
    prompt.factory = true
    return prompt
  }) : []
  const newFactoryPromptIds = newFactoryPrompts.map((prompt) => prompt.id)
  const existingUserPrompts = getPrompts().filter((prompt) => !prompt.factory)
  const existingFactoryPrompts = getPrompts().filter((prompt) => prompt.factory && !newFactoryPromptIds.includes(prompt.id))
  const existingFactoryPromptIds = existingFactoryPrompts.map((prompt) => prompt.id)
  const allFactoryPromptIds = [...existingFactoryPromptIds, ...newFactoryPrompts.map((prompt) => prompt.id)]
  const newUserPrompts = readPrompts
      .filter((prompt) => !prompt.factory && !allFactoryPromptIds.includes(prompt.id))
      .map((prompt) => {
        prompt.factory = false
        return prompt
      }) ?? []

  const existingHistory = getConversationsHistory()
  const newHistory = readHistory ?? []

  // Existing conversations are not overwritten.
  const importedHistory: Conversation[] = [...existingHistory, ...newHistory]
      .filter((conversation, index, self) =>
          index === self.findIndex((other) => other.id === conversation.id))
  saveConversationsHistory(importedHistory)
  if (importedHistory.length > 0) {
    saveSelectedConversation(importedHistory[importedHistory.length - 1])
  } else {
    removeSelectedConversation()
  }

  // Existing user folders are not overwritten.
  const importedUserFolders: FolderInterface[] = [...existingUserFolders, ...newUserFolders]
      .filter((folder, index, self) =>
          index === self.findIndex((other) => other.id === folder.id))
  const importedFolders = [...existingFactoryFolders, ...newFactoryFolders, ...importedUserFolders]
  saveFolders(importedFolders)

  // Existing user prompts are not overwritten.
  const importedUserPrompts: Prompt[] = [...existingUserPrompts, ...newUserPrompts]
      .filter((prompt, index, self) =>
          index === self.findIndex((other) => other.id === prompt.id))
  const importedPrompts = [...existingFactoryPrompts, ...newFactoryPrompts, ...importedUserPrompts]
  savePrompts(importedPrompts)

  return {
    version: 4,
    history: importedHistory,
    folders: importedFolders,
    prompts: importedPrompts
  }
}