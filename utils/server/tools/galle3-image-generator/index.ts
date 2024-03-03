import OpenAI from "openai"
import {ImageGenerateParams} from "openai/resources"

import Dalle3ImageGeneratorConfigurationJsonSchema from "./dalle3-image-generator-configuration-schema.json"
import Dalle3ImageGeneratorParametersJsonSchema from "./dalle3-image-generator-parameters-schema.json"
import {Dalle3ImageGeneratorConfiguration} from "./gen/dalle3-image-generator-configuration-schema"
import {Dalle3ImageGeneratorParameters} from "./gen/dalle3-image-generator-parameters-schema"
import {OPENAI_API_HOST} from "@/utils/app/const"
import {BackendTool} from "@/utils/server/tools"

const dalle3ImageGenerator: BackendTool<Dalle3ImageGeneratorConfiguration, Dalle3ImageGeneratorParameters> = {
  id: "dalle3ImageGenerator",
  name: "DALL·E 3",
  description: "Generate images from text with DALL·E 3",
  type: "function",

  parameters: Dalle3ImageGeneratorParametersJsonSchema,
  configuration_parameters: Dalle3ImageGeneratorConfigurationJsonSchema,

  execute: runDalle3,
  hasConfiguration: () => Boolean(process.env.OPENAI_API_KEY),
  getConfiguration: () => ({
    apiKey: process.env.OPENAI_API_KEY!
  })
}

async function runDalle3({apiKey}: Dalle3ImageGeneratorConfiguration, args: Dalle3ImageGeneratorParameters) {
  const openai = new OpenAI({
    baseURL: `${OPENAI_API_HOST}/openai/deployments/dep-dall-e-3`,
    defaultQuery: {"api-version": "2024-02-15-preview"},
    defaultHeaders: {"api-key": apiKey}
  })

  let body: ImageGenerateParams = {
    ...args,
    response_format: "url"
  }

  return openai.images.generate(body)
}

export default dalle3ImageGenerator
