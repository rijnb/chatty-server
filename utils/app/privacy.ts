export const MSG_CHARS_PRIVACY_LIMIT = 40

export const trimForPrivacy = (str: string, nrOfExtraChars = 0) => {
  return `${str
    .replace(/^\s+/, "")
    .replace(/\s+$/, "")
    .replace(/\n+/, "|")
    .substring(0, MSG_CHARS_PRIVACY_LIMIT + nrOfExtraChars)}${
    str.length > MSG_CHARS_PRIVACY_LIMIT + nrOfExtraChars ? "…" : ""
  }`
}
