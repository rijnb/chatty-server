// This type is used to store a prompt in the store.
export interface Prompt {
  id: string
  name: string
  description: string
  content: string
  folderId: string | undefined
  factory: boolean | undefined
}
