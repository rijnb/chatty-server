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
import {isOpenAIReasoningModel, maxInputTokensForModel, maxOutputTokensForModel, OpenAIModel} from "@/types/openai"
import {
  OPENAI_API_HOST,
  OPENAI_API_HOST_BACKUP,
  OPENAI_API_TYPE,
  OPENAI_API_VERSION,
  OPENAI_AZURE_DEPLOYMENT_ID,
  OPENAI_ORGANIZATION,
  SWITCH_BACK_TO_PRIMARY_HOST_TIMEOUT_MS
} from "@/utils/app/const"
import {getModelIdFromAzureDeploymentId} from "@/utils/app/azure"

// Host switching mechanism.
let currentHost = OPENAI_API_HOST
let switchBackToPrimaryHostTime: number | undefined = undefined

function switchToBackupHost(): void {
  if (currentHost !== OPENAI_API_HOST_BACKUP) {
    console.log(
      `Switching to backup host: ${OPENAI_API_HOST_BACKUP} for the next ${SWITCH_BACK_TO_PRIMARY_HOST_TIMEOUT_MS / 60000} minutes.`
    )
    currentHost = OPENAI_API_HOST_BACKUP
    switchBackToPrimaryHostTime = Date.now() + SWITCH_BACK_TO_PRIMARY_HOST_TIMEOUT_MS
  }
}

function switchBackToPrimaryHostIfNeeded(): void {
  if (currentHost !== OPENAI_API_HOST && switchBackToPrimaryHostTime && Date.now() >= switchBackToPrimaryHostTime) {
    console.log(`Switching to primary host: ${OPENAI_API_HOST}`)
    currentHost = OPENAI_API_HOST
    switchBackToPrimaryHostTime = undefined
  }
}

function createGetModelsUrls(host: string): string {
  let url = `${host}/v1/models?api-version=${OPENAI_API_VERSION}`
  if (OPENAI_API_TYPE === "azure") {
    url = `${host}/openai/deployments?api-version=${OPENAI_API_VERSION}`
  }
  console.debug(`Get models (${OPENAI_API_TYPE}): ${url}`)
  return url
}

// Helper function to process the models response.
async function processModelsResponse(response: Response): Promise<OpenAIModel[]> {
  const json = await response.json()
  const uniqueModelIds = new Set()

  // Find models to display.
  const models: OpenAIModel[] = json.data
    .map((model: any) => {
      const cleanId = getModelIdFromAzureDeploymentId(OPENAI_AZURE_DEPLOYMENT_ID, model.id)
      return {
        id: model.id,
        inputTokenLimit: maxInputTokensForModel(cleanId),
        outputTokenLimit: maxOutputTokensForModel(cleanId),
        isOpenAiReasoningModel: isOpenAIReasoningModel(cleanId)
      }
    })
    .filter((model: OpenAIModel) => {
      const cleanId = getModelIdFromAzureDeploymentId(OPENAI_AZURE_DEPLOYMENT_ID, model.id)
      if (uniqueModelIds.has(cleanId)) {
        return false
      } else {
        uniqueModelIds.add(cleanId)
        return true
      }
    })
    .sort((a: OpenAIModel, b: OpenAIModel) => a.id.localeCompare(b.id))
  console.debug(`Found ${models.length} models: ${models.map((model) => model.id).join(", ")}`)
  return models
}

const handler = async (req: Request): Promise<Response> => {
  let resultResponse: Response
  const {apiKey} = (await req.json()) as {apiKey: string}

  // Switch back to primary host after a timeout.
  switchBackToPrimaryHostIfNeeded()

  // Compose URL to get models.
  let url = createGetModelsUrls(currentHost)

  // Compose HTTP headers.
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

  console.debug(`Using ${currentHost === OPENAI_API_HOST ? "primary" : "backup"} host: ${currentHost}`)
  try {
    const modelsResponse = await fetch(url, {headers: headers})
    if (modelsResponse.ok) {
      // Primary host OK.
      const models = await processModelsResponse(modelsResponse)
      resultResponse = new Response(JSON.stringify(models), {status: 200})
    } else {
      // Primary host response not OK. This should not cause a switch to the backup host.
      console.error(`Primary host for getting models for '${OPENAI_API_TYPE}' returned an error: ${JSON.stringify(modelsResponse)}`)
      resultResponse = new Response("Error", {
        status: 500,
        statusText: modelsResponse ? JSON.stringify(modelsResponse) : ""
      })
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
          const models = await processModelsResponse(backupResponse)
          resultResponse = new Response(JSON.stringify(models), {status: 200})
        } else {
          // Backup host response not OK.
          console.error(`Backup host for getting models for '${OPENAI_API_TYPE}' returned an error: ${JSON.stringify(backupResponse)}`)
          resultResponse = resultResponse = new Response("Error", {
            status: 500,
            statusText: backupResponse ? JSON.stringify(backupResponse) : ""
          })
        }
      } catch (backupError) {
        // Backup host response throws an HTTP error.
        console.error(`Backup host for '${OPENAI_API_TYPE}' threw an exception: ${JSON.stringify(error)}`)

        // Return a 5xx error.
        resultResponse = resultResponse = new Response("Error", {
          status: 500,
          statusText: backupError ? JSON.stringify(backupError) : ""
        })
      }
    } else {
      // Some other exception. No retry.
      console.error(`Primary host for '${OPENAI_API_TYPE}' returned a non-5xx error: ${JSON.stringify(error)}`)
      resultResponse = resultResponse = new Response("Error", {
        status: 500,
        statusText: error ? JSON.stringify(error) : ""
      })
    }
  }
  return resultResponse
}

export const config = {
  runtime: "edge"
}

export default handler
