import {JSONSchema} from "openai/src/lib/jsonschema"

import dalle3ImageGenerator from "@/utils/server/tools/dalle3ImageGenerator"
import googleSearch from "@/utils/server/tools/google"

export interface ToolDescription {
  id: string
  type: "function"
  name: string
  description: string
  parameters: JSONSchema
  configuration_parameters: JSONSchema
}

export interface BackendTool<C, A> extends ToolDescription {
  execute: (config: C, args: A) => any
  hasConfiguration: () => boolean
  getConfiguration: () => C
}

export const ToolsRegistry = [googleSearch, dalle3ImageGenerator]
export type ToolId = (typeof ToolsRegistry)[number]["id"]
