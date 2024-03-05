// This is a temporary solution to the problem of finding the correct Azure deployment ID.

export const getAzureDeploymentIdForModelId = (deploymentId: string, modelId: string) => {
  // Replace part of '-' with correct model.
  const ids = deploymentId.split(";")
  const found = ids.filter((id) => id.endsWith(modelId))
  if (found.length > 0) {
    return found[0]
  } else if (ids[0].includes("-")) {
    return deploymentId.split("-")[0] + "-" + modelId
  } else {
    return ids[0]
  }
}
