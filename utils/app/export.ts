import {generateFilename, sanitizeFilename} from "@/utils/app/filename"

import {Conversation} from "@/types/chat"
import {ExportFormatV4, LatestExportFormat} from "@/types/export"
import {FolderInterface} from "@/types/folder"

import Zip from "adm-zip"


export function isExportFormatV4(obj: any): obj is ExportFormatV4 {
  return obj.version === 4
}

export const exportMarkdown = () => {
  const conversationsString = localStorage.getItem("conversationHistory")
  const conversations: Conversation[] = conversationsString
    ? (JSON.parse(conversationsString) as Conversation[])
    : []
  const foldersString = localStorage.getItem("folders")
  const folders: FolderInterface[] = (
    foldersString ? (JSON.parse(foldersString) as FolderInterface[]) : []
  ).filter((folder) => folder.type === "chat")
  const zip = new Zip()

  // add folders as directories
  if (folders) {
    for (const folder of folders) {
      zip.addFile(`${sanitizeFilename(folder.name)}/`, Buffer.from([]))
    }
  }

  // Filter "chat" type folders and create an object with ids as keys and names as values
  const chatFolderNames: {[id: string]: string} = folders
    .filter((folder) => folder.type === "chat")
    .reduce((accumulator: {[id: string]: string}, folder) => {
      accumulator[folder.id] = sanitizeFilename(folder.name)
      return accumulator
    }, {})

  // add conversations as Markdown files
  if (conversations) {
    for (const conversation of conversations) {
      let markdownContent = ""
      for (const message of conversation.messages) {
        markdownContent += `## ${
          message.role.charAt(0).toUpperCase() + message.role.slice(1)
        }\n\n${message.content}\n\n`
      }
      const folderId = conversation.folderId ?? ""
      const directory =
        folderId in chatFolderNames ? chatFolderNames[folderId] : ""
      const filename = `${sanitizeFilename(conversation.name)}.md`
      zip.addFile(directory + "/" + filename, Buffer.from(markdownContent))
    }
  }

  const zipDownload = zip.toBuffer()
  const url = URL.createObjectURL(new Blob([zipDownload]))
  const link = document.createElement("a")
  link.download = generateFilename("markdown", "zip")
  link.href = url
  link.style.display = "none"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const exportData = (prefix: string, type: string) => {
  const c = localStorage.getItem("conversationHistory")
  let conversations = c ? JSON.parse(c) : []
  const p = localStorage.getItem("prompts")
  let prompts = p ? JSON.parse(p) : []
  const f = localStorage.getItem("folders")
  let folders: FolderInterface[] = f ? JSON.parse(f) : []
  folders = folders.filter((folder) => folder.type === type)

  const data = {
    version: 4,
    history: type === "chat" ? conversations : [],
    prompts: type == "prompt" ? prompts : [],
    folders: folders
  } as LatestExportFormat

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