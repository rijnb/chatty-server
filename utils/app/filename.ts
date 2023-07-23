export const generateFilename = (prefix: string, suffix: string) => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const hours = String(now.getHours()).padStart(2, "0")
  const minutes = String(now.getMinutes()).padStart(2, "0")
  const seconds = String(now.getSeconds()).padStart(2, "0")
  return `${prefix}_${year}${month}${day}_${hours}${minutes}${seconds}${
    suffix.startsWith(".") ? "" : "."
  }${suffix}`
}

// replace common problematic filename characters
export const sanitizeFilename = (filename: string): string => {
  const regex = /[\/\\:*?"<>|]+/g
  return filename.replace(regex, "_")
}
