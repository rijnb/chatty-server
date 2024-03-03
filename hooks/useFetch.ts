export type BaseOptions = {
  interceptors?: Interceptors
  returnRawResponse?: boolean
  signal?: AbortSignal
}

export type RequestOptions = BaseOptions & {
  body?: any
  headers?: HeadersInit
}

export class FetchError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export class RemoteError extends FetchError {
  status: number
  statusText: string
  error: any

  constructor(status: number, statusText: string, error: any) {
    super(`${status} ${statusText}`)
    this.status = status
    this.statusText = statusText
    this.error = error
  }
}

export type Interceptors = {
  request?: ({options, url}: {options: RequestInit; url?: string}) => Promise<RequestInit> | RequestInit
  response?: ({response}: {response: Response; request: RequestInit}) => Promise<Response>
}

function createArgs(baseOptions: BaseOptions, requestOptions: RequestOptions, method: string) {
  const effectiveOptions: RequestOptions = {
    ...baseOptions,
    ...requestOptions
  }

  const headers = effectiveOptions.body
    ? {...requestOptions.headers, "Content-Type": "application/json"}
    : requestOptions.headers

  const requestInit: RequestInit = {
    method,
    ...(effectiveOptions.body && {body: JSON.stringify(effectiveOptions.body)}),
    ...(effectiveOptions.signal && {signal: effectiveOptions.signal}),
    ...(headers && {headers})
  }
  return {effectiveOptions, requestInit}
}

async function handleResponse<T>(response: Response, returnRawResponse: boolean = false): Promise<T> {
  if (returnRawResponse) {
    return response as unknown as T
  }

  if (response.ok) {
    return await response.json()
  } else {
    const errorContent =
      response.headers.get("content-type")?.indexOf("application/json") !== -1
        ? await response.json()
        : await response.text()

    const remoteError = new RemoteError(response.status, response.statusText, errorContent)
    console.error("RemoteError", remoteError)
    throw remoteError
  }
}

async function safeFetch(url: string, callOptions: RequestInit): Promise<Response> {
  try {
    return await fetch(url, callOptions)
  } catch (error: any) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error
    }
    console.error("Unexpected error", error)
    throw new Error(`Request failed with error ${error}`)
  }
}

async function doFetch<T>(
  url: string,
  method: string,
  baseOptions: BaseOptions,
  requestOptions: RequestOptions = {}
): Promise<T> {
  const {effectiveOptions, requestInit} = createArgs(baseOptions, requestOptions, method)

  const callOptions = (await effectiveOptions.interceptors?.request?.({options: requestInit, url})) ?? requestInit

  const raw = await safeFetch(url, callOptions)
  const response = (await effectiveOptions.interceptors?.response?.({response: raw, request: callOptions})) ?? raw
  return handleResponse<T>(response, effectiveOptions.returnRawResponse)
}

export const useFetch = (baseOptions: BaseOptions = {}) => {
  return {
    get: async <T>(url: string, requestOptions?: RequestOptions): Promise<T> =>
      doFetch<T>(url, "GET", baseOptions, requestOptions),
    post: async <T>(url: string, requestOptions?: RequestOptions): Promise<T> =>
      doFetch<T>(url, "POST", baseOptions, requestOptions)
  }
}
