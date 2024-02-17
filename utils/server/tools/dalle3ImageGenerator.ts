import OpenAI from "openai"

import {OPENAI_API_HOST} from "@/utils/app/const"
import {BackendTool} from "@/utils/server/tools/index"

type Dalle3ImageGeneratorConfiguration = {
  apiKey: string
}

type Dalle3ImageGeneratorArgs = {
  prompt: string
}

const dalle3ImageGenerator: BackendTool<Dalle3ImageGeneratorConfiguration, Dalle3ImageGeneratorArgs> = {
  id: "dalle3ImageGenerator",
  name: "DALL·E 3",
  description: "Generate images from text with DALL·E 3",
  type: "function",

  parameters: {
    type: "object",
    properties: {
      prompt: {
        type: "string",
        description: "The prompt for the image"
      }
    },
    required: ["prompt"]
  },
  configuration_parameters: {
    type: "object",
    properties: {
      apiKey: {
        type: "string",
        description: "The OpenAI API key"
      }
    },
    required: ["apiKey"]
  },

  execute: runDalle3,
  hasConfiguration: () => Boolean(process.env.OPENAI_API_KEY),
  getConfiguration: () => ({
    apiKey: process.env.OPENAI_API_KEY!
  })
}

async function runDalle3({apiKey}: Dalle3ImageGeneratorConfiguration, {prompt}: Dalle3ImageGeneratorArgs) {
  console.info("Dalle3ImageGenerator", prompt)
  const openai = new OpenAI({
    baseURL: `${OPENAI_API_HOST}/openai/deployments/dep-dall-e-3`,
    defaultQuery: {"api-version": "2024-02-15-preview"},
    defaultHeaders: {"api-key": apiKey}
  })

  const image = await openai.images.generate({
    prompt,
    response_format: "url"
  })

  console.info("Dalle3ImageGenerator", image)
  return image
}

export default dalle3ImageGenerator
