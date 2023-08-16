export interface FolderInterface {
  id: string
  name: string
  type: FolderType
  factory: boolean | undefined
}

export type FolderType = "chat" | "prompt"
