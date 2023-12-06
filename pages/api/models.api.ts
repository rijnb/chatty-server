import {OpenAIModel, OpenAIModelID, OpenAIModels} from "@/types/openai"
import {OPENAI_API_HOST, OPENAI_API_TYPE, OPENAI_API_VERSION, OPENAI_ORGANIZATION} from "@/utils/app/const"

export const config = {
  runtime: "edge"
}

const handler = async (req: Request): Promise<Response> => {
  try {
    const {apiKey} = (await req.json()) as {apiKey: string}

    let url = `${OPENAI_API_HOST}/v1/models`
    if (OPENAI_API_TYPE === "azure") {
      url = `${OPENAI_API_HOST}/openai/models?api-version=${OPENAI_API_VERSION}`
    }
    console.debug(`Get models (${OPENAI_API_TYPE}): ${url}`)
    const headers = {
      "Content-Type": "application/json",
      ...(OPENAI_API_TYPE === "openai" && {
        Authorization: `Bearer ${apiKey || process.env.OPENAI_API_KEY}`
      }),
      ...(OPENAI_API_TYPE === "openai" &&
        OPENAI_ORGANIZATION && {
          "OpenAI-Organization": OPENAI_ORGANIZATION
        }),
      ...(OPENAI_API_TYPE === "azure" && {
        "api-key": `${apiKey || process.env.OPENAI_API_KEY}`
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
              name: OpenAIModels[value].name,
              tokenLimit: OpenAIModels[value].tokenLimit
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
    console.error(`Error retrieving models, error:${error}`)
    return new Response("Error", {status: 500, statusText: error ? JSON.stringify(error) : ""})
  }
}

export default handler
