import {Interceptors} from "@/hooks/useFetch"
import {useUnlock} from "@/components/UnlockCode/UnlockContext"

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
          if (error.includes("You are not authorized to use the service. Check your Unlock code.")) {
            setInvalidCode(true)
            throw new Error("You are not authorized to use the service. Check your Unlock code.")
          }
        }
      }

      return response
    }
  } as Interceptors
}
