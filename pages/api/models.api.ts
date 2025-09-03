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
import {RemoteError} from "@/hooks/useFetch"
import {
  isOpenAIReasoningModel,
  maxInputTokensForModel,
  maxOutputTokensForModel,
  OpenAIModel,
  OpenAIModels
} from "@/types/openai"
import {
  OPENAI_API_HOST,
  OPENAI_API_HOST_BACKUP,
  OPENAI_API_KEY,
  OPENAI_API_KEY_BACKUP,
  OPENAI_API_TYPE,
  OPENAI_API_VERSION,
  OPENAI_ORGANIZATION,
  SWITCH_BACK_TO_PRIMARY_HOST_TIMEOUT_MS
} from "@/utils/app/const"

// Host switching mechanism.
let currentHost = ""
let currentApiKey = ""
let switchBackToPrimaryHostTime: number | undefined = undefined

function switchToBackupHost(): void {
  if (currentHost !== OPENAI_API_HOST_BACKUP) {
    console.log(
      `Switching to backup host: ${OPENAI_API_HOST_BACKUP} for the next ${SWITCH_BACK_TO_PRIMARY_HOST_TIMEOUT_MS / 60000} minutes.`
    )
    currentHost = OPENAI_API_HOST_BACKUP
    currentApiKey = OPENAI_API_KEY_BACKUP
    switchBackToPrimaryHostTime = Date.now() + SWITCH_BACK_TO_PRIMARY_HOST_TIMEOUT_MS
  }
}

function switchBackToPrimaryHostIfNeeded(forced = false): void {
  if (forced || !currentHost || (currentHost !== OPENAI_API_HOST && switchBackToPrimaryHostTime && Date.now() >= switchBackToPrimaryHostTime)) {
    console.log(`Switching back to primary host${forced ? " (forced)" : ""}: ${OPENAI_API_HOST}`)
    currentHost = OPENAI_API_HOST
    currentApiKey = OPENAI_API_KEY
    switchBackToPrimaryHostTime = undefined
  }
}

function createGetModelsUrls(host: string): string {
  let url = `${host}/v1/models?api-version=${OPENAI_API_VERSION}`
  if (OPENAI_API_TYPE === "azure") {
    url = `${host}/openai/models?api-version=${OPENAI_API_VERSION}`
  }
  console.debug(`Get models (for ${OPENAI_API_TYPE}): ${url}`)
  return url
}

// Helper function to process the models response.
async function processModelsResponse(response: Response): Promise<Response> {
  const json = await response.json()
  const uniqueModelIds = new Set()

  // TODO: Remove temporary solution to add and remove specific models for a specific (Azure) deployment.
  const addHiddenModels = OPENAI_API_TYPE === "azure" ? [OpenAIModels["gpt-4o"], OpenAIModels["gpt-4o-mini"]] : []
  const removeVisibleModels = OPENAI_API_TYPE === "azure" ? ["gpt-35-turbo-16k", "gpt-4", "gpt-4-32k"] : []

  // Find models to display.
  const models: OpenAIModel[] = json.data
    .map((model: any) => {
      return {
        id: model.id,
        inputTokenLimit: maxInputTokensForModel(model.id),
        outputTokenLimit: maxOutputTokensForModel(model.id),
        isOpenAiReasoningModel: isOpenAIReasoningModel(model.id)
      }
    })
    .filter((model: any) => !removeVisibleModels.includes(model.id))
    .concat(addHiddenModels)
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

const handler = async (req: Request): Promise<Response> => {
  let responseInit: ResponseInit = {status: 500, statusText: ""}
  const {apiKey} = (await req.json()) as {apiKey: string}

  // Switch back to primary host after a timeout.
  switchBackToPrimaryHostIfNeeded()

  // Compose URL to get models.
  let url = createGetModelsUrls(currentHost)

  const headers = {
    "Content-Type": "application/json",
    ...(OPENAI_API_TYPE === "openai" && {
      Authorization: `Bearer ${currentApiKey ?? apiKey}`
    }),
    ...(OPENAI_API_TYPE === "openai" &&
      OPENAI_ORGANIZATION && {
        "OpenAI-Organization": OPENAI_ORGANIZATION
      }),
    ...(OPENAI_API_TYPE === "azure" && {
      "api-key": currentApiKey ?? apiKey
    })
  }

  console.debug(`Using ${currentHost === OPENAI_API_HOST ? "primary" : "backup"} host: ${currentHost}`)
  try {
    const response = await fetch(url, {headers: headers})
    if (response.ok) {
      // Primary host OK.
      return await processModelsResponse(response)
    } else {
      // Primary host response not OK. This should not cause a switch to the backup host.
      console.error(
        `Primary host for getting models for '${OPENAI_API_TYPE}' returned an error: ${JSON.stringify(response)}`
      )
      responseInit = {status: 500, statusText: response ? JSON.stringify(response) : ""}
    }
  } catch (error) {
    // Primary host response returns HTTP error.
    console.error(`Primary host for '${OPENAI_API_TYPE}' threw an exception; ${JSON.stringify(error)}`)
    if (
      currentHost !== OPENAI_API_HOST_BACKUP &&
      (!(error instanceof RemoteError) || (error.status >= 500 && error.status < 600))
    ) {
      // Exception was thrown because the primary server (not the backup one) returns an 5xx error.
      console.log(`Switching to backup host due to error: ${JSON.stringify(error)}`)
      switchToBackupHost()

      // Retry with the backup host. Recreate the URL with the new host. HTTP headers remains the same.
      let backupUrl = createGetModelsUrls(currentHost)

      try {
        const backupResponse = await fetch(backupUrl, {headers: headers})
        if (backupResponse.ok) {
          // Backup host OK.
          return await processModelsResponse(backupResponse)
        } else {
          // Backup host response not OK.
          console.error(
            `Backup host for getting models for '${OPENAI_API_TYPE}' returned an error: ${JSON.stringify(backupResponse)}`
          )
          responseInit = {status: 500, statusText: backupResponse ? JSON.stringify(backupResponse) : ""}
        }
      } catch (backupError) {
        // Backup host response throws an HTTP error.
        console.error(`Backup host for '${OPENAI_API_TYPE}' threw an exception: ${JSON.stringify(error)}`)

        // Return a 5xx error.
        responseInit = {status: 500, statusText: backupError ? JSON.stringify(backupError) : ""}
      }
    } else {
      // Some other exception. No retry.
      console.error(`Primary host for '${OPENAI_API_TYPE}' returned a non-5xx error: ${JSON.stringify(error)}`)
      responseInit = {status: 500, statusText: error ? JSON.stringify(error) : ""}
    }
  }
  console.error(`Returning HTTP error: ${JSON.stringify(responseInit)}`)
  return new Response("Error", responseInit)
}

export const config = {
  runtime: "edge"
}

export default handler
