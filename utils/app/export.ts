import {getConversationsHistory} from "@/utils/app/conversation"
import {generateFilename} from "@/utils/app/filename"
import {getFolders} from "@/utils/app/folders"
import {getPrompts} from "@/utils/app/prompts"
import {ExportFormatV4, LatestExportFormat} from "@/types/export"
import {FolderType} from "@/types/folder"


export function isExportFormatV4(obj: any): obj is ExportFormatV4 {
  return obj.version === 4
}

export const exportData = (prefix: string, type: FolderType) => {
  let conversations = getConversationsHistory()
  let prompts = getPrompts()
  let folders = getFolders().filter((folder) => folder.type === type)

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