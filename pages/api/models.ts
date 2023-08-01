import {OPENAI_API_HOST, OPENAI_API_TYPE, OPENAI_API_VERSION, OPENAI_ORGANIZATION} from "@/utils/app/const"
import {OpenAIModel, OpenAIModelID, OpenAIModels} from "@/types/openai"


export const config = {
  runtime: "edge"
}

const handler = async (req: Request): Promise<Response> => {
  try {
    const {key} = (await req.json()) as {key: string}

    let url = `${OPENAI_API_HOST}/v1/models`
    if (OPENAI_API_TYPE === "azure") {
      url = `${OPENAI_API_HOST}/openai/models?api-version=${OPENAI_API_VERSION}`
    }
    console.info(`Get models (${OPENAI_API_TYPE}): ${url}`)
    const headers = {
      "Content-Type": "application/json",
      ...(OPENAI_API_TYPE === "openai" && {
        Authorization: `Bearer ${key ? key : process.env.OPENAI_API_KEY}`
      }),
      ...(OPENAI_API_TYPE === "openai" &&
        OPENAI_ORGANIZATION && {
          "OpenAI-Organization": OPENAI_ORGANIZATION
        }),
      ...(OPENAI_API_TYPE === "azure" && {
        "api-key": `${key ? key : process.env.OPENAI_API_KEY}`
      })
    }
    const response = await fetch(url, {headers: headers})
    if (!response.ok) {
      console.error(`${OPENAI_API_TYPE} returned an error, status:${response.status}`)
      return new Response(response.body, {
        status: response.status,
        headers: response.headers
      })
    }

    const json = await response.json()
    const models: OpenAIModel[] = json.data
      .map((model: any) => {
        for (const [key, value] of Object.entries(OpenAIModelID)) {
          if (value === model.id) {
            return {
              id: model.id,
              name: OpenAIModels[value].name + " (" + OPENAI_API_TYPE + ")",
              tokenLimit: OpenAIModels[value].tokenLimit,
              maxLength: OpenAIModels[value].maxLength
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
    return new Response("Error", {status: 500, statusText: error ? error.toString() : ""})
  }
}

export default handler
