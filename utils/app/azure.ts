export const getAzureDeploymentIdForModelId = (deploymentId: string, modelId: string) => {
  // Use a ';'-separated list of IDs.
  const ids = deploymentId.split(";")

  // If there are no IDs, return the modelId.
  if (ids.length === 0) {
    return modelId
  }

  // Find an exact match for an ID ending in modelId.
  const found = ids.filter((id) => id.endsWith(modelId))
  if (found.length > 0) {
    return found[0]
  }

  // Otherwise, replace the prefix if there's a "-" in modelId.
  if (ids[0].includes("-")) {
    return deploymentId.split("-")[0] + "-" + modelId
  } else {
    return ids[0]
  }
}
