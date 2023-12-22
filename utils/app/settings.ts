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
