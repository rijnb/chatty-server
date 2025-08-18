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
import {isOpenAIReasoningModel, maxInputTokensForModel, maxOutputTokensForModel, OpenAIModel} from "@/types/openai"
import {
  OPENAI_API_HOST,
  OPENAI_API_HOST_BACKUP,
  OPENAI_API_TYPE,
  OPENAI_API_VERSION,
  OPENAI_ORGANIZATION, SWITCH_BACK_TO_PRIMARY_HOST_TIMEOUT_MS
} from "@/utils/app/const"
import {RemoteError} from "@/hooks/useFetch"

// Host switching mechanism.
let currentHost = OPENAI_API_HOST
let switchBackToPrimaryHostTime: number | undefined = undefined

function switchToBackupHost(): void {
  if (currentHost !== OPENAI_API_HOST_BACKUP) {
    console.log(`Switching to backup host: ${OPENAI_API_HOST_BACKUP} for the next ${SWITCH_BACK_TO_PRIMARY_HOST_TIMEOUT_MS / 60000} minutes.`)
    currentHost = OPENAI_API_HOST_BACKUP
    switchBackToPrimaryHostTime = Date.now() + SWITCH_BACK_TO_PRIMARY_HOST_TIMEOUT_MS
  }
}

function switchBackToPrimaryHostIfNeeded(): void {
  if (currentHost !== OPENAI_API_HOST && switchBackToPrimaryHostTime && Date.now() >= switchBackToPrimaryHostTime) {
    console.log(`Switching back to primary host: ${OPENAI_API_HOST_BACKUP}`)
    currentHost = OPENAI_API_HOST
    switchBackToPrimaryHostTime = undefined
  }
}

// Helper function to process the models response
async function processModelsResponse(response: Response): Promise<Response> {
  const json = await response.json()
  const uniqueModelIds = new Set()
  const models: OpenAIModel[] = json.data
    .map((model: any) => {
      return {
        id: model.id,
        inputTokenLimit: maxInputTokensForModel(model.id),
        outputTokenLimit: maxOutputTokensForModel(model.id),
        isOpenAiReasoningModel: isOpenAIReasoningModel(model.id)
      }
    })
    .filter(Boolean)
    .filter((model: OpenAIModel) => model.inputTokenLimit > 0)
    .filter((model: OpenAIModel) => {
      if (uniqueModelIds.has(model.id)) {
        return false
      } else {
        uniqueModelIds.add(model.id)
        return true
      }
    })
    .sort((a: OpenAIModel, b: OpenAIModel) => a.id.localeCompare(b.id))
  console.debug(`Found ${models.length} models: ${models.map((model) => model.id).join(", ")}`)
  return new Response(JSON.stringify(models), {status: 200})
}

export const config = {
  runtime: "edge"
}

const handler = async (req: Request): Promise<Response> => {
  let responseInit: ResponseInit = {status: 500, statusText: ""}
  const {apiKey} = (await req.json()) as {apiKey: string}

  // Use getCurrentHost() to get the current host (primary or backup)
  switchBackToPrimaryHostIfNeeded()

  let url = `${currentHost}/v1/models`
  if (OPENAI_API_TYPE === "azure") {
    url = `${currentHost}/openai/models?api-version=${OPENAI_API_VERSION}`
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

  try {
    const response = await fetch(url, {headers: headers})
    if (response.ok) {

      // Primary host OK.
      return await processModelsResponse(response)
    } else {

      // Primary host response not OK.
      console.error(`${OPENAI_API_TYPE} returned an error, ${response}`)
      responseInit = {status: 500, statusText: response ? JSON.stringify(response) : ""}
    }
  } catch (error) {

    // Primary host response returns HTTP error.
    console.error(`${OPENAI_API_TYPE} threw an exception, ${error}`)
    if (currentHost !== OPENAI_API_HOST_BACKUP &&
      (!(error instanceof RemoteError) || (error.status >= 500 && error.status < 600))) {

      // Exception was thrown because remote server returns an error.
      // If it's a 5xx error and we're not already using the backup host, try the backup host.
      console.log(`Switching to backup host due to error: ${error}`)
      switchToBackupHost()

      // Retry with the backup host.
      let backupUrl = `${currentHost}/v1/models`
      if (OPENAI_API_TYPE === "azure") {
        backupUrl = `${currentHost}/openai/models?api-version=${OPENAI_API_VERSION}`
      }
      console.debug(`Retrying get models with backup host (${OPENAI_API_TYPE}): ${backupUrl}`)

      try {
        const backupResponse = await fetch(backupUrl, {headers: headers})
        if (backupResponse.ok) {

          // Backup host OK.
          return await processModelsResponse(backupResponse)
        } else {

          // Backup host response not OK.
          console.error(`${OPENAI_API_TYPE} backup returned an error, ${backupResponse}`)
          responseInit = {status: 500, statusText: backupResponse ? JSON.stringify(backupResponse) : ""}
        }
      } catch (backupError) {

        // Backup host response throws an HTTP error.
        console.error(`${OPENAI_API_TYPE} backup threw an exception, ${backupError}`)
        responseInit = {status: 500, statusText: backupError ? JSON.stringify(backupError) : ""}
      }
    } else {

      // Some other exception. No retry.
      console.error(`Exception thrown, error: ${error}`)
      responseInit = {status: 500, statusText: error ? JSON.stringify(error) : ""}
    }
  }
  console.error(`Returning HTTP error: ${JSON.stringify(responseInit)}`)
  return new Response("Error", responseInit)
}

export default handler
