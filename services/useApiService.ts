import {useCallback} from "react"
import useApiHelper from "@/hooks/useApiHelper"
import {useFetch} from "@/hooks/useFetch"
import {Plugin, PluginID} from "@/types/plugin"


export interface GetModelsRequestProps {
  key: string
}

const useApiService = () => {
  const fetchService = useFetch()
  const {getApiUrl} = useApiHelper()

  const getModels = useCallback(
    (params: GetModelsRequestProps, unlockCode = "", signal?: AbortSignal) => {
      return fetchService.post<GetModelsRequestProps>(getApiUrl("/api/models"), {
        body: {key: params.key},
        headers: {
          "Content-Type": "application/json",
          ...(unlockCode && {Authorization: `Bearer ${unlockCode}`})
        },
        signal
      })
    },
    [fetchService, getApiUrl]
  )

  const getEndpoint = useCallback(
    (plugin: Plugin | null) => {
      if (!plugin) {
        return getApiUrl("/api/chat")
      }

      if (plugin.id === PluginID.GOOGLE_SEARCH) {
        return getApiUrl("/api/google")
      }

      return getApiUrl("/api/chat")
    },
    [getApiUrl]
  )

  return {
    getModels,
    getEndpoint
  }
}

export default useApiService
