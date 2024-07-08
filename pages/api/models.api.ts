/*
 * Copyright (C) 2024, Rijn Buve.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions
 * of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import {OpenAIModel, maxInputTokensForModel, maxOutputTokensForModel} from "@/types/openai"
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
        return {
          id: model.id,
          inputTokenLimit: maxInputTokensForModel(model.id),
          outputTokenLimit: maxOutputTokensForModel(model.id)
        }
      })
      // Filter "falsy" items:
      .filter(Boolean)
      // Filter out unsupported models:
      .filter((model: OpenAIModel) => model.inputTokenLimit > 0)
      // Filter out duplicate models:
      .filter((obj: OpenAIModel, index: any, self: OpenAIModel[]) => {
        return index === self.findIndex((other: any) => other.id === obj.id)
      })
    console.debug(`Found ${models.length} models: ${models.map((model) => model.id).join(", ")}`)
    return new Response(JSON.stringify(models), {status: 200})
  } catch (error) {
    console.error(`Error retrieving models, error:${error}`)
    return new Response("Error", {status: 500, statusText: error ? JSON.stringify(error) : ""})
  }
}

export default handler
