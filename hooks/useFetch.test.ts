import fetchMock from "jest-fetch-mock"

import {Interceptors, RemoteError, useFetch} from "@/hooks/useFetch"

jest.spyOn(global.console, "error").mockImplementation()

describe("useFetch", () => {
  type ResponseData = {content: string}
  type RequestData = {key: string}

  describe("Configuration", () => {
    it("should use base configuration", async () => {
      fetchMock.mockResponseOnce(JSON.stringify({content: "12345"}))

      const controller = new AbortController()
      await useFetch({signal: controller.signal}).get<ResponseData>("/api/test")

      expect(fetchMock.mock.calls).toHaveLength(1)
      expect(fetchMock.mock.lastCall).toStrictEqual([
        "/api/test",
        {
          method: "GET",
          signal: controller.signal
        }
      ])
    })

    it("should use request configuration", async () => {
      fetchMock.mockResponseOnce(JSON.stringify({content: "12345"}))

      const controller = new AbortController()

      await useFetch().get<ResponseData>("/api/test", {
        signal: controller.signal,
        headers: {
          accept: "application/json"
        }
      })

      expect(fetchMock.mock.calls).toHaveLength(1)
      expect(fetchMock.mock.lastCall).toStrictEqual([
        "/api/test",
        {
          method: "GET",
          signal: controller.signal,
          headers: {
            accept: "application/json"
          }
        }
      ])
    })
  })

  describe("Happy cases", () => {
    it("should call fetch", async () => {
      fetchMock.mockResponseOnce(JSON.stringify({content: "12345"}))

      await useFetch().get("/api/test")

      expect(fetchMock.mock.calls).toHaveLength(1)
      expect(fetchMock.mock.lastCall).toStrictEqual([
        "/api/test",
        {
          method: "GET"
        }
      ])
    })

    it("should return a response", async () => {
      fetchMock.mockResponseOnce(JSON.stringify({content: "12345"}))

      const result = await useFetch().get<ResponseData>("/api/test")

      expect(result).toStrictEqual({content: "12345"})
    })

    it("should apply request interceptors", async () => {
      fetchMock.mockResponseOnce(JSON.stringify({content: "12345"}))

      const authInterceptor: Interceptors = {
        request: async ({options}) => {
          return {
            ...options,
            headers: {
              ...options.headers,
              Authorization: "Bearer something"
            }
          }
        }
      }

      await useFetch({interceptors: authInterceptor}).get("/api/test")

      expect(fetchMock.mock.calls).toHaveLength(1)
      expect(fetchMock.mock.lastCall).toStrictEqual([
        "/api/test",
        {
          method: "GET",
          headers: {
            Authorization: "Bearer something"
          }
        }
      ])
    })

    it("should apply response interceptors", async () => {
      fetchMock.mockResponseOnce(JSON.stringify({content: "12345"}), {status: 401})

      const authInterceptor: Interceptors = {
        response: async ({response}) => {
          if (response.status === 401) {
            throw new Error("Unauthorized")
          }

          return response
        }
      }

      const result = useFetch({interceptors: authInterceptor}).get("/api/test")

      await expect(result).rejects.toThrow("Unauthorized")

      expect(fetchMock.mock.calls).toHaveLength(1)
      expect(fetchMock.mock.lastCall).toStrictEqual([
        "/api/test",
        {
          method: "GET"
        }
      ])
    })

    it("should call post", async () => {
      fetchMock.mockResponseOnce(JSON.stringify({content: "12345"}))

      const requestBody: RequestData = {key: "value"}
      const result = await useFetch().post<ResponseData>("/api/test", {body: requestBody})

      expect(result).toStrictEqual({
        content: "12345"
      })

      expect(fetchMock.mock.calls).toHaveLength(1)
      expect(fetchMock.mock.lastCall).toStrictEqual([
        "/api/test",
        {
          method: "POST",
          body: JSON.stringify(requestBody),
          headers: {
            "Content-Type": "application/json"
          }
        }
      ])
    })

    it("should return raw Response if requested", async () => {
      fetchMock.mockResponseOnce(JSON.stringify({content: "12345"}))

      const requestBody: RequestData = {key: "value"}
      const result = await useFetch().post<Response>("/api/test", {body: requestBody, returnRawResponse: true})

      expect(result).toBeInstanceOf(Response)
      expect(result.status).toBe(200)
      expect(await result.json()).toStrictEqual({content: "12345"})

      expect(fetchMock.mock.calls).toHaveLength(1)
      expect(fetchMock.mock.lastCall).toStrictEqual([
        "/api/test",
        {
          method: "POST",
          body: JSON.stringify(requestBody),
          headers: {
            "Content-Type": "application/json"
          }
        }
      ])
    })
  })

  describe("Failure cases", () => {
    it("should re-throw if fetch throws", async () => {
      fetchMock.mockRejectOnce(new Error("Network error"))

      await expect(useFetch().get("/api/test")).rejects.toThrow("Network error")

      expect(console.error).toHaveBeenCalledWith("Unexpected error", new Error("Network error"))
      expect(fetchMock.mock.calls).toHaveLength(1)
      expect(fetchMock.mock.lastCall).toStrictEqual(["/api/test", {method: "GET"}])
    })

    it("should parse error if not 200", async () => {
      fetchMock.mockResponseOnce(JSON.stringify({errorCode: "mistery"}), {
        status: 400,
        headers: {"content-type": "application/json"}
      })

      const expectedError = new RemoteError(400, "Bad Request", {errorCode: "mistery"})

      await expect(useFetch().get("/api/test")).rejects.toThrow(expectedError)
      expect(console.error).toHaveBeenCalledWith("RemoteError", expectedError)
      expect(fetchMock.mock.calls).toHaveLength(1)
      expect(fetchMock.mock.lastCall).toStrictEqual(["/api/test", {method: "GET"}])
    })

    it("should abort request", async () => {
      const abortController = new AbortController()
      abortController.abort()

      await expect(useFetch().get("/api/test", {signal: abortController.signal})).rejects.toThrow(
        "Request was cancelled"
      )
      expect(console.error).toHaveBeenCalledWith("Request was cancelled", expect.any(Error))
    })
  })
})
