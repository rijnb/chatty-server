import OpenAI from "openai"

import {OPENAI_API_HOST} from "@/utils/app/const"
import {BackendTool} from "@/utils/server/tools/index"

type Dalle3ImageGeneratorConfiguration = {
  apiKey: string
}

type Dalle3ImageGeneratorArgs = {
  prompt: string
  size?: "1024x1024" | "1792x1024" | "1024x1792"
  quality?: "standard" | "hd"
  style?: "vivid" | "natural"
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
        description: "A text description of the desired image. The maximum length is 4000 characters."
      },
      size: {
        type: "string",
        enum: ["1024x1024", "1792x1024", "1024x1792"],
        description: "The size of the generated images"
      },
      quality: {
        type: "string",
        enum: ["standard", "hd"],
        description:
          "The quality of the image that will be generated. `hd` creates images with finer details and greater consistency across the image."
      },
      style: {
        type: "string",
        enum: ["vivid", "natural"],
        description:
          "The style of the generated images. Vivid creates images that are hyper-realistic and dramatic. Natural creates images that are more natural and less hyper-realistic."
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

async function runDalle3({apiKey}: Dalle3ImageGeneratorConfiguration, args: Dalle3ImageGeneratorArgs) {
  console.info("Dalle3ImageGenerator", args)
  const openai = new OpenAI({
    baseURL: `${OPENAI_API_HOST}/openai/deployments/dep-dall-e-3`,
    defaultQuery: {"api-version": "2024-02-15-preview"},
    defaultHeaders: {"api-key": apiKey}
  })

  const image = await openai.images.generate({
    ...args,
    response_format: "url"
  })

  console.info("Dalle3ImageGenerator", image)
  return image
}

export default dalle3ImageGenerator
