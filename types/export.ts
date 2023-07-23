import {Conversation} from "./chat"
import {FolderInterface} from "./folder"
import {Prompt} from "./prompt"


export type SupportedExportFormats = ExportFormatV4 // Older format not supported.

export type LatestExportFormat = ExportFormatV4

export interface ExportFormatV4 {
  version: 4
  history: Conversation[]
  folders: FolderInterface[]
  prompts: Prompt[]
}