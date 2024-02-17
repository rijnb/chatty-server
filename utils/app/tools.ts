import {localStorageSafeGetItem, localStorageSafeRemoveItem, localStorageSafeSetItem} from "@/utils/app/storage"
import {ToolDescription} from "@/utils/server/tools"

export type Tool = ToolDescription & {
  hasServerConfiguration: boolean
}

export type ToolConfigurations = {
  [toolId: string]: any
}

export const STORAGE_KEY_TOOL_CONFIGURATIONS = "toolConfigurations"

export const getToolConfigurations = (): ToolConfigurations => {
  const toolConfigurationsRaw = localStorageSafeGetItem(STORAGE_KEY_TOOL_CONFIGURATIONS)
  try {
    return toolConfigurationsRaw ? (JSON.parse(toolConfigurationsRaw) as ToolConfigurations) : {}
  } catch (error) {
    console.error(`Local storage error:${error}`)
    return {}
  }
}

export const saveToolConfigurations = (toolConfigurations: ToolConfigurations) =>
  localStorageSafeSetItem(STORAGE_KEY_TOOL_CONFIGURATIONS, JSON.stringify(toolConfigurations))

export const removeToolConfigurations = () => {
  localStorageSafeRemoveItem(STORAGE_KEY_TOOL_CONFIGURATIONS)
}
