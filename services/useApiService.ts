import {useCallback} from "react"
import useApiHelper from "@/hooks/useApiHelper"
import {Plugin, PluginID} from "@/types/plugin"
import {useFetchWithUnlockCode} from "@/components/UnlockCode"


export interface GetModelsRequestProps {
  apiKey: string
}

const useApiService = () => {
  const fetchService = useFetchWithUnlockCode()
  const {getApiUrl} = useApiHelper()

  const getModels = useCallback(
    (params: GetModelsRequestProps, signal?: AbortSignal) => {
      return fetchService.post<GetModelsRequestProps>(getApiUrl("/api/models"), {
        body: {apiKey: params.apiKey},
        headers: {
          "Content-Type": "application/json"
        },
        signal
      })
    },
    [fetchService, getApiUrl]
  )

  const getEndpoint = useCallback(
    (plugin: Plugin | null) => {
      if (plugin && plugin.id === PluginID.GOOGLE_SEARCH) {
        return getApiUrl("/api/google")
      } else {
        return getApiUrl("/api/chat")
      }
    },
    [getApiUrl]
  )

  return {
    getModels,
    getEndpoint
  }
}

export default useApiService