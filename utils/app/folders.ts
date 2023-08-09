import {FolderInterface, FolderType} from "@/types/folder"
import {v4 as uuidv4} from "uuid"

export const STORAGE_KEY_FOLDERS = "folders"

export const createNewFolder = (name: string, type: FolderType): FolderInterface => {
  return {id: uuidv4(), name, type, factory:null}
}

export const getFolders = (): FolderInterface[] => {
  const foldersAsString = localStorage.getItem(STORAGE_KEY_FOLDERS)
  try {
    return foldersAsString ? (JSON.parse(foldersAsString) as FolderInterface[]) : []
  } catch (error) {
    console.error(`Local storage error:${error}`)
    return []
  }
}

export const saveFolders = (folders: FolderInterface[]) => {
  localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(folders))
}

export const removeFolders = () => localStorage.removeItem(STORAGE_KEY_FOLDERS)