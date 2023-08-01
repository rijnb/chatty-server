/**
 * Generates a filename by concatenating a prefix, a timestamp, and a suffix.
 *
 * @param prefix - The string prefix to prepend to the generated filename.
 * @param suffix - The string suffix, typically a file extension, to append to the generated filename.
 * @returns A string representing the generated filename, formatted as `prefix_yyyyMMdd_HHmmss.suffix`.
 */
export const generateFilename = (prefix: string, suffix: string) => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const hours = String(now.getHours()).padStart(2, "0")
  const minutes = String(now.getMinutes()).padStart(2, "0")
  const seconds = String(now.getSeconds()).padStart(2, "0")
  return `${prefix}_${year}${month}${day}_${hours}${minutes}${seconds}${suffix.startsWith(".") ? "" : "."}${suffix}`
}
