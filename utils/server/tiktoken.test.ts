import {Message} from "@/types/chat"
import {OpenAIModelID} from "@/types/openai"
import {OpenAILimitExceeded} from "@/utils/server/openAiClient"
import {TiktokenEncoder} from "@/utils/server/tiktoken"

describe("Tiktoken", () => {
  describe("Encoder", () => {
    it("should initialize encoder", async () => {
      const encoder = await TiktokenEncoder.create()
      expect(encoder).toBeDefined()
    })

    describe("gpt4 Tokenizer", () => {
      it("should count tokens", async () => {
        const encoder = await TiktokenEncoder.create()

        const messages: Message[] = [
          {
            role: "system",
            content: "You are a helpful assistant."
          },
          {
            role: "user",
            content: "what's up ?"
          }
        ]

        expect(encoder.numberOfTokensInConversation(messages, OpenAIModelID.GPT_4_32K)).toEqual(21)
      })

      it("should count tokens2", async () => {
        const encoder = await TiktokenEncoder.create()

        const messages: Message[] = [
          {
            role: "system",
            content: "You are a helpful assistant."
          },
          {
            role: "user",
            content: "ping"
          }
        ]
        expect(encoder.numberOfTokensInConversation(messages, OpenAIModelID.GPT_4_32K)).toEqual(18)
      })
    })

    describe("gpt3 Tokenizer", () => {
      it("should count tokens", async () => {
        const encoder = await TiktokenEncoder.create()

        const messages: Message[] = [
          {
            role: "system",
            content: "You are a helpful assistant."
          },
          {
            role: "user",
            content: "what's up ?"
          }
        ]

        expect(encoder.numberOfTokensInConversation(messages, OpenAIModelID.GPT_35_TURBO)).toEqual(23)
      })

      it("should count tokens2", async () => {
        const encoder = await TiktokenEncoder.create()

        const messages: Message[] = [
          {
            role: "system",
            content: "You are a helpful assistant."
          },
          {
            role: "user",
            content: "ping"
          }
        ]
        expect(encoder.numberOfTokensInConversation(messages, OpenAIModelID.GPT_35_TURBO)).toEqual(20)
      })
    })
  })

  describe("Prepare messages to send", () => {
    const prompt = "You are ChatGPT, a large language model trained by OpenAI. Respond using markdown."

    const messages: Message[] = [
      {
        role: "user",
        content: "You'll talk like a pirate. How is the weather?"
      },
      {
        role: "assistant",
        content:
          "Ahoy matey! Th' weather be a fine one fer sailin', with clear skies an' a gentle breeze blowin'. A perfect day fer plunderin' an' seekin' adventure on th' high seas! Arr!"
      },
      {role: "user", content: "Where are you sailing?"},
      {
        role: "assistant",
        content:
          "Ahoy! We be sailin' towards th' mystic island o' Tortuga, where we'll be findin' treasures, grog, an' merry tales aplenty. Arrr, it be a haven fer pirates like us, seekin' fortune an' adventure on th' boundless deep!"
      },
      {
        role: "user",
        content: "Did you find treasure?"
      }
    ]

    it("should retain messages if fit into the limit", async () => {
      const encoder = await TiktokenEncoder.create()

      expect(encoder.prepareMessagesToSend(4000, 1000, prompt, messages, OpenAIModelID.GPT_4_32K)).toEqual(messages)
    })

    it("should allow single message", async () => {
      const encoder = await TiktokenEncoder.create()

      expect(encoder.prepareMessagesToSend(4000, 1000, prompt, [messages[1]], OpenAIModelID.GPT_4_32K)).toEqual([
        messages[1]
      ])
    })

    const testCases = [
      {tokenLimit: 200, maxReplyTokens: 70, expectedMessages: [messages[0], messages[2], messages[3], messages[4]]},
      {
        tokenLimit: 200,
        maxReplyTokens: 80,
        expectedMessages: [messages[0], messages[3], messages[4]]
      },
      {
        tokenLimit: 200,
        maxReplyTokens: 149,
        expectedMessages: [messages[0], messages[4]]
      }
    ]

    testCases.forEach((testCase) => {
      const {tokenLimit, maxReplyTokens, expectedMessages} = testCase

      it(`should drop messages starting from 2nd until fit the limit: tokenLimit=${tokenLimit}, maxReplyTokens=${maxReplyTokens}`, async () => {
        const encoder = await TiktokenEncoder.create()

        expect(
          encoder.prepareMessagesToSend(tokenLimit, maxReplyTokens, prompt, messages, OpenAIModelID.GPT_4_32K)
        ).toEqual(expectedMessages)
      })
    })

    it("should throw if no messages fit (for completeness)", async () => {
      const encoder = await TiktokenEncoder.create()

      expect(() => encoder.prepareMessagesToSend(200, 180, prompt, messages, OpenAIModelID.GPT_4_32K)).toThrow(
        new OpenAILimitExceeded("Not enough tokens to send a message.", 200, 222)
      )
      expect(() => encoder.prepareMessagesToSend(200, 180, prompt, messages, OpenAIModelID.GPT_4_32K)).toThrowExactly(
        new OpenAILimitExceeded("Not enough tokens to send a message.", 200, 222)
      )
    })
  })
})
