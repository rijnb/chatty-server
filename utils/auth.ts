import {NextApiRequest} from "next"

function parseApiKey(bearToken: string): string {
  return bearToken.trim().replaceAll("Bearer ", "").trim()
}

function timingSafeEqual(a: string, b: string) {
  const aBytes = new TextEncoder().encode(a)
  const bBytes = new TextEncoder().encode(b)

  if (aBytes.length !== bBytes.length) {
    return false
  }
  let result = 0
  for (let i = 0; i < aBytes.length; i++) {
    result |= aBytes[i] ^ bBytes[i]
  }
  return result === 0
}

export function auth(req: Request | NextApiRequest) {
  const SERVER_UNLOCK_CODE = process.env.OPENAI_UNLOCK_CODE ?? ""
  if (!SERVER_UNLOCK_CODE) {
    return {error: false}
  }

  // Check if it's a NextApiRequest (Next.js) or a Request (Express.js).
  let authToken: string
  if (typeof req.headers.get === "function") {
    authToken = req.headers.get("Authorization") ?? ""
  } else {
    authToken = (req as unknown as NextApiRequest).headers["authorization"] ?? ""
  }

  return timingSafeEqual(parseApiKey(authToken), SERVER_UNLOCK_CODE)
    ? {error: false}
    : {error: true, status: 401, statusText: "Unauthorized"}
}
