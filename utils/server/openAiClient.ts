import OpenAI from "openai"
import {
  ChatCompletionStreamingRunner,
  ChatCompletionStreamingToolRunnerParams
} from "openai/lib/ChatCompletionStreamingRunner"
import {BaseFunctionsArgs, RunnableToolFunctionWithParse} from "openai/lib/RunnableFunction"

import {
  OPENAI_API_HOST,
  OPENAI_API_KEY,
  OPENAI_API_TYPE,
  OPENAI_API_VERSION,
  OPENAI_AZURE_DEPLOYMENT_ID,
  OPENAI_ORGANIZATION
} from "../app/const"
import {Message} from "@/types/chat"
import {getAzureDeploymentIdForModelId} from "@/utils/app/azure"
import AzureOpenAI from "@/utils/server/azureOpenAI"
import {ToolId, ToolsRegistry} from "@/utils/server/tools"

const createOpenAI = (apiKey: string, modelId: string) => {
  const getApiKey = () => {
    return apiKey || OPENAI_API_KEY
  }

  if (OPENAI_API_TYPE === "azure") {
    return new AzureOpenAI({
      baseURL: `${OPENAI_API_HOST}/openai/deployments/${getAzureDeploymentIdForModelId(
        OPENAI_AZURE_DEPLOYMENT_ID,
        modelId
      )}`,
      apiKey: getApiKey(),
      apiVersion: OPENAI_API_VERSION
    })
  } else {
    return new OpenAI({
      apiKey: getApiKey(),
      baseURL: `${OPENAI_API_HOST}\v1`,
      organization: OPENAI_ORGANIZATION
    })
  }
}

export const chatCompletionStream = (
  modelId: string,
  systemPrompt: string,
  temperature: number,
  maxTokens: number,
  apiKey: string,
  selectedTools: ToolId[],
  toolUserConfigurations: Record<string, any>,
  messages: Message[]
): ChatCompletionStreamingRunner => {
  const openai = createOpenAI(apiKey, modelId)

  if (messages.length === 0) {
    throw new Error("No messages in history")
  }

  const toolsToUse: RunnableToolFunctionWithParse<any>[] = ToolsRegistry.filter((tool) =>
    selectedTools.includes(tool.id)
  )
    .filter((tool) => tool.hasConfiguration() || toolUserConfigurations[tool.id])
    .map((tool) => {
      const configuration = tool.hasConfiguration() ? tool.getConfiguration() : toolUserConfigurations[tool.id]
      return {
        type: "function",
        function: {
          name: tool.id,
          description: tool.description,
          parameters: tool.parameters,
          parse: JSON.parse,
          function: (args) => tool.execute(configuration, args)
        }
      }
    })

  const body: ChatCompletionStreamingToolRunnerParams<BaseFunctionsArgs> = {
    model: modelId,
    messages: [
      {role: "system", content: systemPrompt},
      ...messages.map((m) => ({
        role: m.role,
        content: m.content
      }))
    ],
    max_tokens: maxTokens,
    temperature: temperature,
    stream: true,
    tools: toolsToUse
  }

  return openai.beta.chat.completions.runTools(body)
}
