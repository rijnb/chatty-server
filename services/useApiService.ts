import {useCallback} from "react"

import {useUnlockCodeInterceptor} from "@/components/UnlockCode"
import useApiHelper from "@/hooks/useApiHelper"
import {useFetch} from "@/hooks/useFetch"
import {Plugin, PluginID} from "@/types/plugin"

export interface GetModelsRequestProps {
  apiKey: string
}

const useApiService = () => {
  const fetchService = useFetch({
    interceptors: useUnlockCodeInterceptor()
  })
  const {getApiUrl} = useApiHelper()

  const getModels = useCallback(
    (params: GetModelsRequestProps, signal?: AbortSignal) => {
      return fetchService.post(getApiUrl("/api/models"), {
        body: {apiKey: params.apiKey},
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
