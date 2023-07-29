import {Plugin, PluginID} from "@/types/plugin"
import {basePath} from "@/config"


const getApiUrl = (path: string) => {
  return `${basePath}${path}`
}

export const getEndpoint = (plugin: Plugin | null) => {
  if (!plugin) {
    return getApiUrl("/api/chat")
  }

  if (plugin.id === PluginID.GOOGLE_SEARCH) {
    return getApiUrl("/api/google")
  }

  return getApiUrl("/api/chat")
}