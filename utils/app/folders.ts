/*
 * Copyright (C) 2024, Rijn Buve.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions
 * of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import {v4 as uuidv4} from "uuid"

import {FolderInterface, FolderType} from "@/types/folder"
import {localStorageSafeGetItem, localStorageSafeRemoveItem, localStorageSafeSetItem} from "@/utils/app/storage"

export const STORAGE_KEY_FOLDERS = "folders"

export const createNewFolder = (name: string, type: FolderType): FolderInterface => {
  return {id: uuidv4(), name, type, factory: undefined}
}

export const getFolders = (): FolderInterface[] => {
  const foldersAsString = localStorageSafeGetItem(STORAGE_KEY_FOLDERS)
  try {
    return foldersAsString ? (JSON.parse(foldersAsString) as FolderInterface[]) : []
  } catch (error) {
    console.error(`Local storage error:${error}`)
    return []
  }
}

export const saveFolders = (folders: FolderInterface[]) => {
  localStorageSafeSetItem(STORAGE_KEY_FOLDERS, JSON.stringify(folders))
}

export const removeFolders = () => localStorageSafeRemoveItem(STORAGE_KEY_FOLDERS)
