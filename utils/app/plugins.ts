import {PluginKey, STORAGE_KEY_PLUGIN_KEYS} from "@/types/plugin"

export const getPluginKeys = (): PluginKey[] => {
  const PluginKeyAsString = localStorage.getItem(STORAGE_KEY_PLUGIN_KEYS)
  try {
    return PluginKeyAsString ? (JSON.parse(PluginKeyAsString) as PluginKey[]) : []
  } catch (error) {
    console.error(`Local storage error: ${error}`)
    return []
  }
}

export const removePluginKeys = () => {
  localStorage.removeItem(STORAGE_KEY_PLUGIN_KEYS)
}