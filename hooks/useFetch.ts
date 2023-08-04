export type RequestModel = {
  params?: object
  headers?: object
  signal?: AbortSignal
}

export type RequestWithBodyModel = RequestModel & {
  body?: object | FormData
}

export const useFetch = () => {
  const handleFetch = async (url: string, request: any, signal?: AbortSignal) => {
    const requestUrl = request?.params ? `${url}${request.params}` : url
    const requestBody = request?.body
      ? request.body instanceof FormData
        ? {...request, body: request.body}
        : {...request, body: JSON.stringify(request.body)}
      : request
    const headers = {
      ...(request?.headers
        ? request.headers
        : request?.body && request.body instanceof FormData
        ? {}
        : {"Content-type": "application/json"})
    }
    console.info(`useFetch: url:${requestUrl}`)
    return fetch(requestUrl, {...requestBody, headers, signal})
      .then((response) => {
        if (!response.ok) {
          console.info(`useFetch: HTTP error, ${response.status}, statusText:${response.statusText}`)
          throw response
        }
        const contentType = response.headers.get("content-type")
        const contentDisposition = response.headers.get("content-disposition")
        return contentType &&
          (contentType?.indexOf("application/json") !== -1 || contentType?.indexOf("text/plain") !== -1)
          ? response.json()
          : contentDisposition?.indexOf("attachment") !== -1
          ? response.blob()
          : response
      })
      .catch(async (error) => {
        const contentType = error.headers.get("content-type")
        const errContent =
          contentType && contentType?.indexOf("application/problem+json") !== -1 ? await error.json() : error
        console.info(`useFetch: HTTP exception error, ${error.status}, statusText:${error.statusText}`)
        throw errContent
      })
  }

  return {
    get: async <T>(url: string, request?: RequestModel): Promise<T> => {
      return handleFetch(url, {...request, method: "get"})
    },
    post: async <T>(url: string, request?: RequestWithBodyModel): Promise<T> => {
      return handleFetch(url, {...request, method: "post"})
    },
    put: async <T>(url: string, request?: RequestWithBodyModel): Promise<T> => {
      return handleFetch(url, {...request, method: "put"})
    },
    patch: async <T>(url: string, request?: RequestWithBodyModel): Promise<T> => {
      return handleFetch(url, {...request, method: "patch"})
    },
    delete: async <T>(url: string, request?: RequestWithBodyModel): Promise<T> => {
      return handleFetch(url, {...request, method: "delete"})
    }
  }
}
