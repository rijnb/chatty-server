import {Conversation} from "./chat"
import {FolderInterface} from "./folder"
import {Prompt} from "./prompt"


export type SupportedFileFormats = FileFormatV4
export type LatestFileFormat = FileFormatV4

/**
 * Do not change this file format, unless there is an upgrade path defined from earlier formats.
 */
export interface FileFormatV4 {
  version: 4
  history: Conversation[]
  folders: FolderInterface[]
  prompts: Prompt[]
}