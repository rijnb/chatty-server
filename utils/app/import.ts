import {Conversation} from "@/types/chat"
import {FolderInterface} from "@/types/folder"
import {ConversationV4, FileFormatV4, FileFormatV5, FileFormatV6, PromptV4, SupportedFileFormats} from "@/types/import"
import {Prompt} from "@/types/prompt"
import {
  getConversationsHistory,
  removeSelectedConversation,
  saveConversationsHistory,
  saveSelectedConversation
} from "@/utils/app/conversations"
import {getFolders, saveFolders} from "@/utils/app/folders"
import {trimForPrivacy} from "@/utils/app/privacy"
import {getPrompts, savePrompts} from "@/utils/app/prompts"

type Data = {
  history: Conversation[]
  prompts: Prompt[]
  folders: FolderInterface[]
}

export function isFileFormatV6(obj: any): obj is FileFormatV6 {
  return obj.version === 6
}

const readFileFormatV6 = (data: FileFormatV6): Data => {
  return {
    history: data.history as Conversation[],
    prompts: data.prompts as Prompt[],
    folders: data.folders as FolderInterface[]
  }
}

export function isFileFormatV5(obj: any): obj is FileFormatV5 {
  return obj.version === 5
}

const readFileFormatV5 = (data: FileFormatV5): Data => {
  return {
    history: data.history as Conversation[],
    prompts: data.prompts as Prompt[],
    folders: data.folders as FolderInterface[]
  }
}

export function isFileFormatV4(obj: any): obj is FileFormatV4 {
  return obj.version === 4
}

const readFileFormatV4 = (data: FileFormatV4): Data => {
  return {
    history: data.history.map((conversation: ConversationV4) => {
      const {model, ...rest} = conversation
      return {modelId: model.id, ...rest} as Conversation
    }),
    prompts: data.prompts.map((prompt: PromptV4) => {
      const {model, ...rest} = prompt
      return {modelId: model.id, ...rest} as Prompt
    }),
    folders: data.folders as FolderInterface[]
  }
}

export const readData = (data: SupportedFileFormats): Data => {
  if (isFileFormatV6(data)) {
    return readFileFormatV6(data)
  } else if (isFileFormatV5(data)) {
    return readFileFormatV5(data)
  } else if (isFileFormatV4(data)) {
    return readFileFormatV4(data)
  }
  throw new Error(`Unsupported data file format version: ${trimForPrivacy(JSON.stringify(data))}`)
}

/**
 * Check syntax of JSON data.
 */
export const isValidJsonData = (jsonData: any): string[] => {
  const errors: string[] = []

  // Top-level.
  if (!jsonData || typeof jsonData !== "object") {
    errors.push("Incorrect top-level structure, expected top-level {object}")
  }
  const {version, history, folders, prompts} = jsonData

  // Version.
  if (
    version === null ||
    version === undefined ||
    typeof version !== "number" ||
    ![4, 5, 6].includes(version) ||
    (history && !Array.isArray(history)) ||
    (prompts && !Array.isArray(prompts)) ||
    (folders && !Array.isArray(folders))
  ) {
    errors.push(
      `Invalid file structure; expected {version, history, prompts, folders}\nGot: ${JSON.stringify(jsonData)}`
    )
  }

  // History.
  if (history) {
    for (const historyItem of history) {
      if (
        !historyItem.id ||
        typeof historyItem.id !== "string" ||
        (historyItem.name && typeof historyItem.name !== "string") ||
        (historyItem.messages && !Array.isArray(historyItem.messages)) ||
        (version === 4 && historyItem.model && typeof historyItem.model !== "object") || // V4 format has model as an object, not a string.
        (version >= 5 && historyItem.modelId && typeof historyItem.modelId !== "string") || // V5+ format has model as a string.
        (historyItem.prompt && typeof historyItem.prompt !== "string") ||
        (historyItem.temperature && typeof historyItem.temperature !== "number") ||
        (historyItem.folderId && typeof historyItem.folderId !== "string") ||
        typeof historyItem.time !== "number"
      ) {
        errors.push(
          `Invalid history, expected {id, name, messages[], ${
            version === 4 ? "model" : "modelId"
          }, prompt, temperature, folderId, time}\nGot: ${JSON.stringify(historyItem)}`
        )
      }
      for (const message of historyItem.messages) {
        if (
          (message.role && typeof message.role !== "string") ||
          !["user", "assistant"].includes(message.role) ||
          (message.content && !(typeof message.content === "string" || typeof message.content === "object"))
        ) {
          errors.push(`Invalid message in history; expected {role, content}\nGot: ${JSON.stringify(message)}`)
        }
      }
    }
  }

  // Prompts.
  if (prompts) {
    for (const promptItem of prompts) {
      if (
        !promptItem.id ||
        typeof promptItem.id !== "string" ||
        (promptItem.name && typeof promptItem.name !== "string") ||
        (promptItem.description && typeof promptItem.description !== "string") ||
        (promptItem.content && typeof promptItem.content !== "string") ||
        (version === 4 && promptItem.model && typeof promptItem.model !== "object") || // V4 format has model as an object, not a string.
        (version >= 5 && promptItem.modelId && typeof promptItem.modelId !== "string") || // V5+ format has model as a string.
        (promptItem.folderId && typeof promptItem.folderId !== "string") ||
        (promptItem.factory && typeof promptItem.factory !== "boolean")
      ) {
        errors.push(
          `Invalid prompt; expected {id, name, description, content, ${
            version === 4 ? "model" : "modelId"
          }, folderId, factory}\nGot: ${JSON.stringify(promptItem)}`
        )
      }
    }
  }

  // Folders.
  if (folders) {
    for (const folderItem of folders) {
      if (
        (folderItem.id && typeof folderItem.id !== "string") ||
        !folderItem.name ||
        typeof folderItem.name !== "string" ||
        !folderItem.type ||
        typeof folderItem.type !== "string" ||
        (folderItem.factory && typeof folderItem.factory !== "boolean")
      ) {
        errors.push(`Invalid folder; expected {id, name, type, factory}\nGot: ${JSON.stringify(folderItem)}`)
      }
    }
  }
  return errors
}

/**
 * Import file and set the 'factory' value for all prompts to a new value (or remove it).
 */
export const importData = (data: SupportedFileFormats, readFactoryData: boolean = false): Data => {
  const {history: readHistory, folders: readFolders, prompts: readPrompts} = readData(data)

  // Extract:
  //   existing user folder     - current non-factory folders
  //   existing factory folder  - current factory folders
  //   new factory folders      - only read when readFactoryData is true
  //                              all folders are marked as factory in that case
  //   new user folders         - only read when readFactoryData is false
  //                              only non-factory folders that have a non-factory folder id
  const newFactoryFolders = readFactoryData
    ? readFolders.map((folder) => {
        folder.factory = true
        return folder
      })
    : []
  const newFactoryFolderIds = newFactoryFolders.map((folder) => folder.id)
  const existingUserFolders = getFolders().filter((folder) => !folder.factory)
  const existingFactoryFolders = getFolders().filter(
    (folder) => folder.factory && !newFactoryFolderIds.includes(folder.id)
  )
  const existingFactoryFolderIds = existingFactoryFolders.map((folder) => folder.id)
  const allFactoryFolderIds = [...existingFactoryFolderIds, ...newFactoryFolderIds]
  const newUserFolders =
    readFolders
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
  const newFactoryPrompts = readFactoryData
    ? readPrompts.map((prompt) => {
        prompt.factory = true
        return prompt
      })
    : []
  const newFactoryPromptIds = newFactoryPrompts.map((prompt) => prompt.id)
  const existingUserPrompts = getPrompts().filter((prompt) => !prompt.factory)
  const existingFactoryPrompts = getPrompts().filter(
    (prompt) => prompt.factory && !newFactoryPromptIds.includes(prompt.id)
  )
  const existingFactoryPromptIds = existingFactoryPrompts.map((prompt) => prompt.id)
  const allFactoryPromptIds = [...existingFactoryPromptIds, ...newFactoryPrompts.map((prompt) => prompt.id)]
  const newUserPrompts =
    readPrompts
      .filter((prompt) => !prompt.factory && !allFactoryPromptIds.includes(prompt.id))
      .map((prompt) => {
        prompt.factory = false
        return prompt
      }) ?? []

  const existingHistory = getConversationsHistory()
  const newHistory = readHistory ?? []

  // Existing conversations are not overwritten.
  const importedHistory: Conversation[] = [...existingHistory, ...newHistory].filter(
    (conversation, index, self) => index === self.findIndex((other) => other.id === conversation.id)
  )
  saveConversationsHistory(importedHistory)
  if (importedHistory.length > 0) {
    saveSelectedConversation(importedHistory[importedHistory.length - 1])
  } else {
    removeSelectedConversation()
  }

  // Existing user folders are not overwritten.
  const importedUserFolders: FolderInterface[] = [...existingUserFolders, ...newUserFolders].filter(
    (folder, index, self) => index === self.findIndex((other) => other.id === folder.id)
  )
  const importedFolders = [...existingFactoryFolders, ...newFactoryFolders, ...importedUserFolders]
  saveFolders(importedFolders)

  // Existing user prompts are not overwritten.
  const importedUserPrompts: Prompt[] = [...existingUserPrompts, ...newUserPrompts].filter(
    (prompt, index, self) => index === self.findIndex((other) => other.id === prompt.id)
  )
  const importedPrompts = [...existingFactoryPrompts, ...newFactoryPrompts, ...importedUserPrompts]
  savePrompts(importedPrompts)

  return {
    history: importedHistory,
    folders: importedFolders,
    prompts: importedPrompts
  }
}
