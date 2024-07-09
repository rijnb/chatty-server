/*
 * Copyright (C) 2024, Rijn Buve.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions
 * of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import chatHandler from "@/pages/api/chat.api"
import {asMock} from "@/testutils"
import {ChatBody} from "@/types/chat"
import {
  ChatCompletionStream,
  GenericOpenAIError,
  OpenAIAuthError,
  OpenAIError,
  OpenAILimitExceeded,
  OpenAIRateLimited
} from "@/utils/server/openAiClient"

jest.mock("@/utils/server/openAiClient", () => {
  return {
    ...jest.requireActual("@/utils/server/openAiClient"),
    ChatCompletionStream: jest.fn()
  }
})

jest.spyOn(global.console, "error").mockImplementation()

describe("Chat Error Handling", () => {
  const createRequest = (chatBody?: ChatBody) =>
    new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify(
        chatBody ??
          ({
            modelId: "gpt-4-32k",
            messages: [{role: "user", content: [{type: "text", text: "ping"}]}],
            apiKey: "",
            prompt: "You are a helpful assistant",
            temperature: 0.8
          } as ChatBody)
      )
    })

  describe("Happy Cases", () => {
    it("should send ChatCompletion request", async () => {
      await chatHandler(
        createRequest({
          modelId: "gpt-4-32k",
          messages: [{role: "user", content: [{type: "text", text: "ping"}]}],
          apiKey: "somekey",
          prompt: "You are a helpful assistant",
          temperature: 1.2,
          outputTokenLimit: 32
        })
      )

      expect(ChatCompletionStream).toHaveBeenCalledWith(
        "gpt-4-32k",
        "You are a helpful assistant",
        1.2,
        32,
        "somekey",
        [{role: "user", content: "ping"}]
      )
    })
  })

  describe("Error Handling", () => {
    const streamError = (error: any) => async () => {
      throw error
    }

    it("should handle exceeding token limit", async () => {
      asMock(ChatCompletionStream).mockImplementation(
        streamError(
          new OpenAILimitExceeded(
            "This model's maximum context length is 16384 tokens. However, you requested 50189 tokens (189 in the messages, 50000 in the completion). Please reduce the length of the messages or completion.",
            16384,
            50189
          )
        )
      )

      const response = await chatHandler(createRequest())

      await expect(response.json()).resolves.toEqual({
        errorType: "context_length_exceeded",
        limit: 16384,
        requested: 50189
      })
      expect(response.status).toEqual(400)
      expect(response.headers.get("Content-Type")).toBe("application/json")
    })

    it("should handle invalid key error", async () => {
      asMock(ChatCompletionStream).mockImplementation(
        streamError(
          new OpenAIAuthError(
            "Access denied due to invalid subscription key. Make sure to provide a valid key for an active subscription."
          )
        )
      )

      const response = await chatHandler(createRequest())

      await expect(response.json()).resolves.toEqual({
        errorType: "openai_auth_error"
      })
      expect(response.status).toEqual(401)
      expect(response.headers.get("Content-Type")).toBe("application/json")
    })

    it("should handle missing key error", async () => {
      asMock(ChatCompletionStream).mockImplementation(
        streamError(
          new OpenAIAuthError(
            "Access denied due to missing subscription key. Make sure to include subscription key when making requests to an API."
          )
        )
      )

      const response = await chatHandler(createRequest())

      await expect(response.json()).resolves.toEqual({
        errorType: "openai_auth_error"
      })
      expect(response.status).toEqual(401)
      expect(response.headers.get("Content-Type")).toBe("application/json")
    })

    it("should handle rate limit error", async () => {
      asMock(ChatCompletionStream).mockImplementation(
        streamError(
          new OpenAIRateLimited(
            "Requests to the Creates a completion for the chat message Operation under Azure OpenAI API version 2023-05-15 have exceeded token rate limit of your current OpenAI S0 pricing tier. Please retry after 26 seconds. Please go here: https://aka.ms/oai/quotaincrease if you would like to further increase the default rate limit.",
            26
          )
        )
      )

      const response = await chatHandler(createRequest())

      await expect(response.json()).resolves.toMatchObject({
        errorType: "rate_limit",
        retryAfter: 26
      })
      expect(response.status).toEqual(429)
      expect(response.headers.get("Content-Type")).toBe("application/json")
    })

    it("should handle generic openai error", async () => {
      asMock(ChatCompletionStream).mockImplementation(
        streamError(
          new GenericOpenAIError(
            "Some human readable description",
            "unknown_error_type",
            "some_parameter",
            "useful_error_code"
          )
        )
      )

      const response = await chatHandler(createRequest())

      await expect(response.json()).resolves.toMatchObject({
        errorType: "generic_openai_error",
        message: "Some human readable description"
      })
      expect(response.status).toEqual(400)
      expect(response.headers.get("Content-Type")).toBe("application/json")
    })

    it("should handle openai error", async () => {
      asMock(ChatCompletionStream).mockImplementation(streamError(new OpenAIError("Some human readable description")))

      const response = await chatHandler(createRequest())

      await expect(response.json()).resolves.toMatchObject({
        errorType: "openai_error",
        message: "Some human readable description"
      })
      expect(response.status).toEqual(500)
      expect(response.headers.get("Content-Type")).toBe("application/json")
    })

    it("should handle unknown error", async () => {
      const typeError = new TypeError("Some type error")
      asMock(ChatCompletionStream).mockImplementation(streamError(typeError))

      const response = await chatHandler(createRequest())

      await expect(response.json()).resolves.toMatchObject({
        errorType: "unexpected_error",
        message: "Some type error"
      })

      expect(response.status).toEqual(500)
      expect(response.headers.get("Content-Type")).toBe("application/json")
      expect(console.error).toHaveBeenCalledWith("Unexpected error", typeError)
    })

    it("should handle not an error", async () => {
      asMock(ChatCompletionStream).mockImplementation(streamError(42))

      const response = await chatHandler(createRequest())

      await expect(response.json()).resolves.toMatchObject({
        errorType: "unexpected_error",
        message: "Unknown error"
      })
      expect(response.status).toEqual(500)
      expect(response.headers.get("Content-Type")).toBe("application/json")
      expect(console.error).toHaveBeenCalledWith("Unexpected error", 42)
    })
  })
})
