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

import {localStorageSafeGetItem, localStorageSafeRemoveItem, localStorageSafeSetItem} from "@/utils/app/storage"

export const STORAGE_KEY_API_KEY = "apiKey"
export const STORAGE_KEY_UNLOCK_CODE = "unlockCode"
export const STORAGE_KEY_SHOW_CHAT_BAR = "showChatBar"
export const STORAGE_KEY_SHOW_PROMPT_BAR = "showPromptBar"

export const getApiKey = () => localStorageSafeGetItem(STORAGE_KEY_API_KEY)
export const saveApiKey = (apiKey: string) => localStorageSafeSetItem(STORAGE_KEY_API_KEY, apiKey)
export const removeApiKey = () => localStorageSafeRemoveItem(STORAGE_KEY_API_KEY)

export const getUnlockCode = () => localStorageSafeGetItem(STORAGE_KEY_UNLOCK_CODE)
export const saveUnlockCode = (unlockCode: string) => localStorageSafeSetItem(STORAGE_KEY_UNLOCK_CODE, unlockCode)
export const removeUnlockCode = () => localStorageSafeRemoveItem(STORAGE_KEY_UNLOCK_CODE)

export const getShowChatBar = () => {
  const value = localStorageSafeGetItem(STORAGE_KEY_SHOW_CHAT_BAR)
  return value ? JSON.parse(value) : false
}
export const saveShowChatBar = (showChatBar: boolean) =>
  localStorageSafeSetItem(STORAGE_KEY_SHOW_CHAT_BAR, JSON.stringify(showChatBar))
export const removeShowChatBar = () => localStorageSafeRemoveItem(STORAGE_KEY_SHOW_CHAT_BAR)

export const getShowPromptBar = () => {
  const value = localStorageSafeGetItem(STORAGE_KEY_SHOW_PROMPT_BAR)
  return value ? JSON.parse(value) : false
}
export const saveShowPromptBar = (showPromptBar: boolean) =>
  localStorageSafeSetItem(STORAGE_KEY_SHOW_PROMPT_BAR, JSON.stringify(showPromptBar))
export const removeShowPromptBar = () => localStorageSafeRemoveItem(STORAGE_KEY_SHOW_PROMPT_BAR)
