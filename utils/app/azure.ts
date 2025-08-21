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

export const getAzureDeploymentIdForModelId = (deploymentIdPrefixes: string, modelId: string) => {
  // Drop "-YYYY-MM-DD" from model name.
  const cleanModelId = modelId.replace(/-\d{4}-\d{2}-\d{2}$/, "")

  // Use a ';'-separated list of IDs.
  const ids = deploymentIdPrefixes.split(";")

  // If there are no IDs, return the cleanModelId.
  if (ids.length === 0) {
    return cleanModelId
  }

  // Find an exact match for an ID ending in cleanModelId.
  const found = ids.filter((id) => id.endsWith(cleanModelId))
  if (found.length > 0) {
    return found[0]
  }

  // Otherwise, replace the prefix if there's a "-" in cleanModelId.
  if (ids[0].includes("-")) {
    return deploymentIdPrefixes.split("-")[0] + "-" + cleanModelId
  } else {
    return ids[0]
  }
}

export const getModelIdFromAzureDeploymentId = (deploymentIdPrefixes: string, modelId: string) => {
  // Use a ';'-separated list of prefixes.
  const prefixes = deploymentIdPrefixes.split(";")

  // If there are no prefixes, return the modelId as-is.
  if (prefixes.length === 0) {
    return modelId
  }

  // Check if the first prefix contains a "-", indicating an optional prefix for modelId.
  const firstPrefix = prefixes[0]
  if (firstPrefix.includes("-")) {
    const optionalPrefix = firstPrefix.split("-")[0] + "-"

    // If modelId starts with the optional prefix, remove it.
    if (modelId.startsWith(optionalPrefix)) {
      return modelId.substring(optionalPrefix.length)
    }
  }

  // Return the modelId as-is if no prefix removal is needed.
  return modelId
}
