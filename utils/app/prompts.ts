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

import {Prompt} from "@/types/prompt"
import {localStorageSafeGetItem, localStorageSafeRemoveItem, localStorageSafeSetItem} from "@/utils/app/storage"

export const STORAGE_KEY_PROMPTS = "prompts"

export const createNewPrompt = (name: string): Prompt => {
  return {
    id: uuidv4(),
    name: name,
    description: "",
    content: "",
    folderId: undefined,
    factory: undefined
  }
}

export const savePrompts = (prompts: Prompt[]) => {
  localStorageSafeSetItem(STORAGE_KEY_PROMPTS, JSON.stringify(prompts))
}

export const getPrompts = (): Prompt[] => {
  const promptsAsString = localStorageSafeGetItem(STORAGE_KEY_PROMPTS)
  try {
    return promptsAsString ? (JSON.parse(promptsAsString) as Prompt[]) : []
  } catch (error) {
    console.error(`Local storage error:${error}`)
    return []
  }
}

export const removePrompts = () => localStorageSafeRemoveItem(STORAGE_KEY_PROMPTS)
