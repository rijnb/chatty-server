import {generateFilename} from "@/utils/app/filename"

import {ExportFormatV4, LatestExportFormat} from "@/types/export"
import {FolderInterface, FolderType} from "@/types/folder"


export function isExportFormatV4(obj: any): obj is ExportFormatV4 {
  return obj.version === 4
}

export const exportData = (prefix: string, type: FolderType) => {
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