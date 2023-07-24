import {OPENAI_API_HOST, OPENAI_API_TYPE, OPENAI_API_VERSION, OPENAI_ORGANIZATION} from "@/utils/app/const"

import {OpenAIModel, OpenAIModelID, OpenAIModels} from "@/types/openai"

import {auth} from "./auth"


export const config = {
  runtime: "edge"
}

const handler = async (req: Request): Promise<Response> => {
  try {
    const authResult = auth(req)
    if (authResult.error) {
      return new Response("Error: You are not authorized to use the service", {
        status: 200, //!! TODO Should be authResult.status,
        statusText: authResult.statusText
      })
    }
    const {key} = (await req.json()) as {
      key: string
    }

    let url = `${OPENAI_API_HOST}/v1/models`
    if (OPENAI_API_TYPE === "azure") {
      url = `${OPENAI_API_HOST}/openai/models?api-version=${OPENAI_API_VERSION}`
    }
    console.info(`Get models from ${OPENAI_API_TYPE}: ${url}`)
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(OPENAI_API_TYPE === "openai" && {
          Authorization: `Bearer ${key ? key : process.env.OPENAI_API_KEY}`
        }),
        ...(OPENAI_API_TYPE === "azure" && {
          "api-key": `${key ? key : process.env.OPENAI_API_KEY}`
        }),
        ...(OPENAI_API_TYPE === "openai" &&
          OPENAI_ORGANIZATION && {
            "OpenAI-Organization": OPENAI_ORGANIZATION
          })
      }
    })

    if (response.status === 401) {
      console.error(`${OPENAI_API_TYPE} returned an error, status:${response.status}`)
      return new Response(response.body, {
        status: 500,
        headers: response.headers
      })
    } else if (response.status !== 200) {
      console.error(`${OPENAI_API_TYPE} returned an error, status:${response.status}: text:${await response.text()}`)
      throw new Error(`${OPENAI_API_TYPE} returned an error,:  status:${response.status}`)
    }

    const json = await response.json()

    const models: OpenAIModel[] = json.data
      .map((model: any) => {
        for (const [key, value] of Object.entries(OpenAIModelID)) {
          if (value === model.id) {
            return {
              id: model.id,
              name: OpenAIModels[value].name + " (" + OPENAI_API_TYPE + ")"
            }
          }
        }
      })
      .filter(Boolean)
      .filter((obj: any, index: any, self: any) => {
        return index === self.findIndex((other: any) => other.id === obj.id)
      })

    return new Response(JSON.stringify(models), {status: 200})
  } catch (error) {
    console.error(`Error: ${error}`)
    return new Response("Error", {status: 500})
  }
}

export default handler