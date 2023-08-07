import {useRouter} from "next/router"

export default function useApiHelper() {
  const {basePath} = useRouter()

  return {
    getApiUrl: (path: string) => `${basePath}${path}`
  }
}
