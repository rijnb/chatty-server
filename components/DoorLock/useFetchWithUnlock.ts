import {RequestModel, RequestWithBodyModel, useFetch} from "@/hooks/useFetch"
import {useUnlock} from "@/components/DoorLock/UnlockProvider"


export const useFetchWithUnlock = () => {
  const originalFetch = useFetch()
  const {code, setInvalidCode} = useUnlock()

  const fetchWithErrorHandling = async (fetchMethod: Function, url: string, request: RequestModel) => {
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
        headers: {...request?.headers, Authorization: `Bearer ${code}`}
      }),
    post: async <T>(url: string, request?: RequestWithBodyModel): Promise<T> =>
      fetchWithErrorHandling(originalFetch.post, url, {
        ...request,
        headers: {...request?.headers, Authorization: `Bearer ${code}`}
      })
    // ... (Other fetch methods)
  }
}
