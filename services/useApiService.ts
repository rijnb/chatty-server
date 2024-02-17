import {useCallback} from "react"

import {useUnlockCodeInterceptor} from "@/components/UnlockCode"
import useApiHelper from "@/hooks/useApiHelper"
import {useFetch} from "@/hooks/useFetch"

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

  return {
    getModels,
    getApiUrl
  }
}

export default useApiService
