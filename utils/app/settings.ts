export const STORAGE_KEY_API_KEY = "apiKey"
export const STORAGE_KEY_UNLOCK_CODE = "unlockCode"
export const STORAGE_KEY_SHOW_CHAT_BAR = "showChatBar"
export const STORAGE_KEY_SHOW_PROMPT_BAR = "showPromptBar"

export const getApiKey = () => localStorage.getItem(STORAGE_KEY_API_KEY)
export const saveApiKey = (apiKey: string) => localStorage.setItem(STORAGE_KEY_API_KEY, apiKey)
export const removeApiKey = () => localStorage.removeItem(STORAGE_KEY_API_KEY)

export const getUnlockCode = () => localStorage.getItem(STORAGE_KEY_UNLOCK_CODE)
export const saveUnlockCode = (unlockCode: string) => localStorage.setItem(STORAGE_KEY_UNLOCK_CODE, unlockCode)
export const removeUnlockCode = () => localStorage.removeItem(STORAGE_KEY_UNLOCK_CODE)

export const getShowChatBar = () => {
  const value = localStorage.getItem(STORAGE_KEY_SHOW_CHAT_BAR)
  return value ? JSON.parse(value) : false
}
export const saveShowChatBar = (showChatBar: boolean) =>
  localStorage.setItem(STORAGE_KEY_SHOW_CHAT_BAR, JSON.stringify(showChatBar))
export const removeShowChatBar = () => localStorage.removeItem(STORAGE_KEY_SHOW_CHAT_BAR)

export const getShowPromptBar = () => {
  const value = localStorage.getItem(STORAGE_KEY_SHOW_PROMPT_BAR)
  return value ? JSON.parse(value) : false
}
export const saveShowPromptBar = (showPromptBar: boolean) =>
  localStorage.setItem(STORAGE_KEY_SHOW_PROMPT_BAR, JSON.stringify(showPromptBar))
export const removeShowPromptBar = () => localStorage.removeItem(STORAGE_KEY_SHOW_PROMPT_BAR)
