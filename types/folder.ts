export interface FolderInterface {
  id: string
  name: string
  type: FolderType
  factory: boolean | null
}

export type FolderType = "chat" | "prompt"
