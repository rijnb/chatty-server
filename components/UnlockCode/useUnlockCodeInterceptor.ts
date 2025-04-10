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
import {useUnlock} from "@/components/UnlockCode/UnlockContext"
import {Interceptors} from "@/hooks/useFetch"

export const useUnlockCodeInterceptor = () => {
  const {isProtected, code, invalidCode, setInvalidCode} = useUnlock()

  if (!isProtected) {
    return {
      request: async ({options}) => {
        return options
      },
      response: async ({response}) => {
        return response
      }
    } as Interceptors
  }

  return {
    request: async ({options}) => {
      if (invalidCode) {
        throw new Error("Invalid code")
      }

      return {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${code}`
        }
      }
    },
    response: async ({response}) => {
      if (response.status === 401) {
        const clonedResponse = response.clone()
        if (clonedResponse.headers.get("content-type")?.indexOf("text/plain") !== -1) {
          const error = await clonedResponse.text()
          if (error.includes("Unlock code")) {
            setInvalidCode(true)
            throw new Error("You are not authorized to use the service. Check your Unlock code.")
          }
        }
      }

      return response
    }
  } as Interceptors
}
