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
