import {
  ChatCompletionStream,
  GenericOpenAIError,
  OpenAIAuthError,
  OpenAIError,
  OpenAILimitExceeded,
  OpenAIRateLimited
} from "@/utils/server/openAiClient"
import chatHandler from "@/pages/api/chat.api"
import {asMock} from "@/testutils"

jest.mock("@/utils/server/openAiClient", () => {
  return {
    ...jest.requireActual("@/utils/server/openAiClient"),
    ChatCompletionStream: jest.fn()
  }
})

describe("Chat Error Handling", () => {
  const createRequest = () =>
    new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({
        modelId: "gpt-4-32k",
        messages: [{role: "user", content: "ping"}],
        key: "",
        prompt: "You are a helpful assistant",
        temperature: 0.8
      })
    })

  const streamError = (error: any) => () => {
    throw error
  }

  jest.spyOn(global.console, "info").mockImplementation()
  jest.spyOn(global.console, "warn").mockImplementation()
  jest.spyOn(global.console, "error").mockImplementation()

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
  })

  it("should handle openai error", async () => {
    asMock(ChatCompletionStream).mockImplementation(streamError(new OpenAIError("Some human readable description")))

    const response = await chatHandler(createRequest())

    await expect(response.json()).resolves.toMatchObject({
      errorType: "openai_error",
      message: "Some human readable description"
    })
    expect(response.status).toEqual(500)
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

    expect(console.error).toHaveBeenCalledWith("Unexpected error", 42)
  })
})
