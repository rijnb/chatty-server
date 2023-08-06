import {RequestModel, RequestWithBodyModel, useFetch} from "@/hooks/useFetch"
import {useUnlock} from "@/components/DoorLock/UnlockProvider"
import unlockCode from "@/components/Settings/UnlockCode";


export const useFetchWithUnlock = () => {
  const originalFetch = useFetch()
  const {code, invalidCode, setInvalidCode} = useUnlock()

  const fetchWithErrorHandling = async (fetchMethod: Function, url: string, request: RequestModel) => {
    console.log("fetchWithErrorHandling", url, code)

    if (invalidCode) {
      throw new Error("Invalid code")
    }

    try {
      return await fetchMethod(url, request)
    } catch (error: any) {
      if (error.status === 401) {
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
        headers: {...request?.headers, Authorization: `${code}`}
      })
    // ... (Other fetch methods)
  }
}
