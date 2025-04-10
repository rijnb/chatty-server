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
import {render, screen} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import fetchMock from "jest-fetch-mock"
import React, {MutableRefObject} from "react"
import toast from "react-hot-toast"
import {v4 as uuidv4} from "uuid"

import Chat, {TOAST_DURATION_MS} from "@/components/Chat/Chat"
import {useUnlock, useUnlockCodeInterceptor} from "@/components/UnlockCode"
import {HomeContextProps, useHomeContext} from "@/pages/api/home/home.context"
import useApiService from "@/services/useApiService"
import {asMock} from "@/testutils"
import {FALLBACK_OPENAI_MODEL, OpenAIModels} from "@/types/openai"
import {OPENAI_DEFAULT_SYSTEM_PROMPT, OPENAI_DEFAULT_TEMPERATURE} from "@/utils/app/const"
import useMarkdownFile from "@/utils/app/markdown"

jest.mock("react-i18next", () => ({
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  },
  initReactI18next: {
    type: "3rdParty",
    init: () => {}
  }
}))

jest.mock("@/utils/app/markdown")
jest.mock("@/services/useApiService")
jest.mock("@/pages/api/home/home.context", () => {
  return {
    ...jest.requireActual("@/pages/api/home/home.context"),
    useHomeContext: jest.fn()
  }
})
jest.mock("react-hot-toast")
jest.mock("@/components/UnlockCode", () => {
  return {
    ...jest.requireActual("@/components/UnlockCode"),
    useUnlock: jest.fn(),
    useUnlockCodeInterceptor: jest.fn()
  }
})
jest.mock("@microsoft/applicationinsights-react-js", () => ({
  useAppInsightsContext: jest.fn(() => ({
    trackEvent: jest.fn()
  }))
}))

Element.prototype.scrollTo = jest.fn()

describe("<Chat/>", () => {
  beforeAll(() => {
    asMock(useUnlock).mockReturnValue({
      isProtected: false,
      unlocked: true,
      code: "",
      setCode: () => {},
      invalidCode: false,
      setInvalidCode: () => {}
    })

    asMock(useUnlockCodeInterceptor).mockReturnValue({
      request: async ({options}) => {
        return options
      },
      response: async ({response}) => {
        return response
      }
    })

    asMock(useHomeContext).mockReturnValue({
      state: {
        apiKey: "",
        pluginKeys: [],
        loading: false,
        messageIsStreaming: false,
        modelError: null,
        models: [OpenAIModels[FALLBACK_OPENAI_MODEL]],
        folders: [],
        conversations: [],
        selectedConversation: {
          id: uuidv4(),
          name: "Test Conversation",
          messages: [],
          tokenCount: 1,
          modelId: FALLBACK_OPENAI_MODEL,
          prompt: OPENAI_DEFAULT_SYSTEM_PROMPT,
          temperature: OPENAI_DEFAULT_TEMPERATURE,
          maxTokens: 1000,
          folderId: undefined,
          time: 1
        },
        currentMessage: undefined,
        prompts: [],
        temperature: OPENAI_DEFAULT_TEMPERATURE,
        showChatBar: true,
        showPromptBar: true,
        currentFolder: undefined,
        messageError: false,
        searchTerm: "",
        defaultModelId: FALLBACK_OPENAI_MODEL,
        serverSideApiKeyIsSet: true,
        serverSidePluginKeysSet: false,
        triggerSelectedPrompt: undefined,
        triggerFactoryPrompts: true,
        reuseModel: true,
        allowModelSelection: true
      },
      handleUpdateConversation: () => {},
      dispatch: () => {}
    } as unknown as HomeContextProps)

    asMock(useApiService).mockReturnValue({
      getModels: () => Promise.resolve([]),
      getEndpoint: () => "stub"
    })

    asMock(useMarkdownFile).mockReturnValue(null)
  })

  const stopConversationRef: MutableRefObject<boolean> = {current: false}

  it("should handle auth error", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({errorType: "openai_auth_error"}), {status: 401})

    render(<Chat stopConversationRef={stopConversationRef} />)

    await userEvent.type(screen.getByTestId("chat-input"), "hello there")
    await userEvent.click(screen.getByTestId("chat-send"))

    expect(toast.error).toHaveBeenCalledTimes(1)
    expect(toast.error).toHaveBeenCalledWith(
      "Invalid API Key. Please enter the correct OpenAI key in left menu bar of Chatty.",
      {duration: TOAST_DURATION_MS}
    )
  })

  it("should handle context length error", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        errorType: "context_length_exceeded",
        limit: 16384,
        requested: 50189
      }),
      {status: 400}
    )

    render(<Chat stopConversationRef={stopConversationRef} />)

    await userEvent.type(screen.getByTestId("chat-input"), "hello there")
    await userEvent.click(screen.getByTestId("chat-send"))

    expect(toast.error).toHaveBeenCalledTimes(1)
    expect(toast.error).toHaveBeenCalledWith(
      "The conversation has become too long. Please reduce the number of messages to shorten it. It's using 50189 tokens, where the limit is 16384 tokens.",
      {duration: TOAST_DURATION_MS}
    )
  })

  it("should handle rate limit error", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        errorType: "rate_limit",
        retryAfter: 26
      }),
      {status: 429}
    )

    render(<Chat stopConversationRef={stopConversationRef} />)

    await userEvent.type(screen.getByTestId("chat-input"), "hello there")
    await userEvent.click(screen.getByTestId("chat-send"))

    expect(toast.error).toHaveBeenCalledTimes(1)
    expect(toast.error).toHaveBeenCalledTimes(1)

    expect(toast.error).toHaveBeenCalledWith("Too many requests. Please wait 26 seconds before trying again.", {
      duration: TOAST_DURATION_MS
    })
  })

  it("should handle generic openai error", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        errorType: "generic_openai_error",
        message: "Some human readable description"
      }),
      {status: 400}
    )

    render(<Chat stopConversationRef={stopConversationRef} />)

    await userEvent.type(screen.getByTestId("chat-input"), "hello there")
    await userEvent.click(screen.getByTestId("chat-send"))

    expect(toast.error).toHaveBeenCalledTimes(1)
    expect(toast.error).toHaveBeenCalledWith("Some human readable description", {
      duration: TOAST_DURATION_MS
    })
  })

  it("should handle openai error", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        errorType: "openai_error",
        message: "Some human readable description"
      }),
      {status: 500}
    )

    render(<Chat stopConversationRef={stopConversationRef} />)

    await userEvent.type(screen.getByTestId("chat-input"), "hello there")
    await userEvent.click(screen.getByTestId("chat-send"))

    expect(toast.error).toHaveBeenCalledTimes(1)
    expect(toast.error).toHaveBeenCalledWith("Some human readable description", {
      duration: TOAST_DURATION_MS
    })
  })

  it("should handle unknown error", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        errorType: "unexpected_error",
        message: "Some type error"
      }),
      {status: 500}
    )

    render(<Chat stopConversationRef={stopConversationRef} />)

    await userEvent.type(screen.getByTestId("chat-input"), "hello there")
    await userEvent.click(screen.getByTestId("chat-send"))

    expect(toast.error).toHaveBeenCalledTimes(1)
    expect(toast.error).toHaveBeenCalledWith("Unexpected server error. Please try again a bit later.", {
      duration: TOAST_DURATION_MS
    })
  })
})
