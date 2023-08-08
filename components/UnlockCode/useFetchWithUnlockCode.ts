import {RequestModel, RequestWithBodyModel, useFetch} from "@/hooks/useFetch"
import {useUnlock} from "@/components/UnlockCode"

export const useFetchWithUnlockCode = () => {
  const originalFetch = useFetch()
  const {isProtected, code, invalidCode, setInvalidCode} = useUnlock()

  const fetchWithErrorHandling = async (fetchMethod: Function, url: string, request: RequestModel) => {
    if (!isProtected) {
      return await fetchMethod(url, request)
    }

    if (invalidCode) {
      throw new Error("Invalid code")
    }

    try {
      return await fetchMethod(url, request)
    } catch (error: any) {
      if (
        error.status === 401 &&
        error.content.includes("Unlock code")
      ) {
        setInvalidCode(true)
      }
      throw error
    }
  }

  return {
    get: async <T>(url: string, request?: RequestModel): Promise<T> =>
      fetchWithErrorHandling(originalFetch.get, url, {
        ...request,
        headers: {...request?.headers, Authorization: `${code}`}
      }),
    post: async <T>(url: string, request?: RequestWithBodyModel): Promise<T> =>
      fetchWithErrorHandling(originalFetch.post, url, {
        ...request,
        headers: {...request?.headers, Authorization: `Bearer ${code}`}
      })
    // ... (Other fetch methods)
  }
}
