/**
 * @jest-environment node
 */
import {
  ChatCompletionStream,
  OpenAIAuthError,
  OpenAIError,
  OpenAILimitExceeded,
  OpenAIRateLimited
} from "@/utils/server/openAiClient"
import chatHandler from "@/pages/api/chat"

const stream = ChatCompletionStream as jest.MockedFunction<typeof ChatCompletionStream>

jest.mock("@/utils/server/openAiClient", () => {
  return {
    ...jest.requireActual("@/utils/server/openAiClient"),
    ChatCompletionStream: jest.fn()
  }
})

afterEach(() => {
  stream.mockReset()
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

  const streamError = (error: Error) => () => {
    throw error
  }

  it("should handle exceeding token limit", async () => {
    stream.mockImplementation(
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
    stream.mockImplementation(
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
    stream.mockImplementation(
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
    stream.mockImplementation(
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
})
