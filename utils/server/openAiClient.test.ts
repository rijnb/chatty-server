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
import fetchMock from "jest-fetch-mock"

import {FALLBACK_OPENAI_MODEL} from "@/types/openai"
import {
  ChatCompletionStream,
  GenericOpenAIError,
  OpenAIAuthError,
  OpenAILimitExceeded,
  OpenAIRateLimited
} from "@/utils/server/openAiClient"

/**
 * This test is verbose on purpose.
 * It's meant to be a documentation of OpenAI Client behavior, including error handling.
 */
describe("OpenAI Client", () => {
  const testCases = {
    "should handle token limit error": {
      openAiResponse: {
        body: {
          error: {
            message:
              "This model's maximum context length is 16384 tokens. However, you requested 50189 tokens (189 in the messages, 50000 in the completion). Please reduce the length of the messages or completion.",
            type: "invalid_request_error",
            param: "messages",
            code: "context_length_exceeded"
          }
        },
        status: 400
      },
      expectedError: new OpenAILimitExceeded(
        "400 This model's maximum context length is 16384 tokens. However, you requested 50189 tokens (189 in the messages, 50000 in the completion). Please reduce the length of the messages or completion.",
        16384,
        50189
      )
    },
    "should handle invalid key error": {
      openAiResponse: {
        body: {
          statusCode: 401,
          message:
            "Access denied due to invalid subscription key. Make sure to provide a valid key for an active subscription."
        },
        status: 401
      },
      expectedError: new OpenAIAuthError("401 status code (no body)")
    },
    "should handle missing key error": {
      openAiResponse: {
        body: {
          statusCode: 401,
          message:
            "Access denied due to missing subscription key. Make sure to include subscription key when making requests to an API."
        },
        status: 401
      },
      expectedError: new OpenAIAuthError("401 status code (no body)")
    },
    "should handle another auth error": {
      openAiResponse: {
        body: {
          error: {
            code: "401",
            message:
              "Access denied due to invalid subscription key or wrong API endpoint. Make sure to provide a valid key for an active subscription and use a correct regional API endpoint for your resource."
          }
        },
        status: 401
      },
      expectedError: new OpenAIAuthError(
        "401 Access denied due to invalid subscription key or wrong API endpoint. Make sure to provide a valid key for an active subscription and use a correct regional API endpoint for your resource."
      )
    },
    "should handle quota limit error": {
      openAiResponse: {
        body: {
          error: {
            code: "429",
            message:
              "Requests to the Creates a completion for the chat message Operation under Azure OpenAI API version 2023-05-15 have exceeded token rate limit of your current OpenAI S0 pricing tier. Please retry after 26 seconds. Please go here: https://aka.ms/oai/quotaincrease if you would like to further increase the default rate limit."
          }
        },
        status: 429
      },
      expectedError: new OpenAIRateLimited(
        "429 Requests to the Creates a completion for the chat message Operation under Azure OpenAI API version 2023-05-15 have exceeded token rate limit of your current OpenAI S0 pricing tier. Please retry after 26 seconds. Please go here: https://aka.ms/oai/quotaincrease if you would like to further increase the default rate limit.",
        26
      )
    },
    "should handle generic openai error": {
      openAiResponse: {
        body: {
          error: {
            message: "Some human readable description",
            type: "unknown_error_type",
            param: "some_parameter",
            code: "useful_error_code"
          }
        },
        status: 400
      },
      expectedError: new GenericOpenAIError(
        "400 Some human readable description",
        "unknown_error_type",
        "",
        "useful_error_code"
      )
    },
    "should handle openai error": {
      openAiResponse: {
        body: {
          error: {
            message: "Some human readable description",
            type: "unknown_error_type",
            param: "some_parameter",
            code: "useful_error_code"
          }
        },
        status: 400
      },
      expectedError: new GenericOpenAIError(
        "400 Some human readable description",
        "unknown_error_type",
        "",
        "useful_error_code"
      )
    }
  }

  test.each(Object.entries(testCases))("%s", async (_, {openAiResponse, expectedError}) => {
    fetchMock.mockResponse(JSON.stringify(openAiResponse.body), {status: openAiResponse.status})

    const result = ChatCompletionStream(
      FALLBACK_OPENAI_MODEL,
      "system prompt",
      0.8,
      32,
      "key",
      [{role: "user", content: "ping"}],
      true
    )

    await expect(result).rejects.toThrowExactly(expectedError)
  })
})
