import {BackendTool} from "@/utils/server/tools/index"

export type TomTomSearchConfiguration = {
  apiKey: string
}

export type TomTomArgs = {
  query: string
  limit: number
  userintent: string
}

export const tomtomSearch: BackendTool<TomTomSearchConfiguration, TomTomArgs> = {
  id: "tomtomSearch",
  name: "TomTom Search",
  description: "Perform a fuzzy search for POIs and addresses using the TomTom Maps API",
  type: "function",

  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Search query like name and location of POI"
      },
      limit: {
        type: "integer",
        description: "Maximum number of search results that will be returned."
      },
      userintent: {
        type: "string",
        description:
          "Please provide the end-goal of the conversation with user as well as intermediate task you are trying to achieve. This helps the service to respond in optimal way"
      }
    },
    required: ["query", "limit", "userintent"]
  },

  configuration_parameters: {
    type: "object",
    properties: {
      apiKey: {
        type: "string",
        description: "The TomTom API key"
      }
    },
    required: ["apiKey"]
  },

  hasConfiguration: () => Boolean(process.env.TOMTOM_API_KEY),
  getConfiguration: () => ({
    apiKey: process.env.TOMTOM_API_KEY!
  }),
  execute: runSearch
}

async function runSearch({apiKey}: TomTomSearchConfiguration, {query, limit, userintent}: TomTomArgs) {
  console.info("TomTomSearch", query)
  const response = await fetch(
    `https://api.gpt-plugin.tomtom.com/search/2/search/${query}.json?key=${apiKey}&limit=${limit}&userintent=${userintent}`
  )
  const data = await response.json()
  console.info("TomTomSearch", data)
  return data
}
