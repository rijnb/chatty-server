/**
 * @jest-environment node
 */
import {getTiktokenEncoding, numTokensInConversation, prepareMessagesToSend} from "@/utils/server/tiktoken"
import {Message} from "@/types/chat"
import {OpenAIModelID} from "@/types/openai"

describe("Tiktoken", () => {
  describe("Encoder", () => {
    it("should initialize encoder", async () => {
      const encoder = await getTiktokenEncoding()
      expect(encoder).toBeDefined()
    })

    describe("Prepare messages to send", () => {
      const prompt = "You are a helpful assistant." // 10 tokens
      const messages: Message[] = [
        {role: "user", content: "Knock knock."}, // 8 tokens
        {role: "assistant", content: "Who's there?"}, //8 tokens
        {role: "user", content: "Orange."} //6 tokens
      ] // 35 tokens

      it("should retain messages if fit into the limit", async () => {
        expect(await prepareMessagesToSend(4000, 1000, prompt, messages, OpenAIModelID.GPT_4_32K)).toEqual(messages)
      })

      it("should skip first message if doesn't fit into the limit", async () => {
        expect(await prepareMessagesToSend(100, 73, prompt, messages, OpenAIModelID.GPT_4_32K)).toEqual([
          {role: "assistant", content: "Who's there?"},
          {role: "user", content: "Orange."}
        ])
      })

      it("should skip first two messages if doesn't fit into the limit", async () => {
        expect(await prepareMessagesToSend(100, 80, prompt, messages, OpenAIModelID.GPT_4_32K)).toEqual([
          {role: "user", content: "Orange."}
        ])
      })

      it("should return empty if no messages fit", async () => {
        expect(await prepareMessagesToSend(100, 100, prompt, messages, OpenAIModelID.GPT_4_32K)).toEqual([])
      })
    })
  })

  describe("gpt4 Tokenizer", () => {
    it("should count tokens", async () => {
      const encoder = await getTiktokenEncoding()

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

      expect(numTokensInConversation(encoder, messages, OpenAIModelID.GPT_4_32K)).toEqual(21)
    })

    it("should count tokens2", async () => {
      const encoder = await getTiktokenEncoding()

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
      expect(numTokensInConversation(encoder, messages, OpenAIModelID.GPT_4_32K)).toEqual(18)
    })
  })

  describe("gpt3 Tokenizer", () => {
    it("should count tokens", async () => {
      const encoder = await getTiktokenEncoding()

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

      expect(numTokensInConversation(encoder, messages, OpenAIModelID.GPT_3_5_AZ)).toEqual(23)
    })

    it("should count tokens2", async () => {
      const encoder = await getTiktokenEncoding()

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
      expect(numTokensInConversation(encoder, messages, OpenAIModelID.GPT_3_5_AZ)).toEqual(20)
    })
  })
})
