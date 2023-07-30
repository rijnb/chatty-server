import {OPENAI_DEFAULT_SYSTEM_PROMPT, OPENAI_DEFAULT_TEMPERATURE} from "@/utils/app/const"
import {convertOldDataFormatToNew, isExportFormatV4, isLatestExportFormat} from "@/utils/app/import"
import {ExportFormatV4} from "@/types/export"
import {OpenAIModelID, OpenAIModels} from "@/types/openai"
import {describe, expect, it} from "vitest"


describe("Export Format Functions", () => {
  describe("isExportFormatV4", () => {
    it("should return true for v4 format", () => {
      const obj = {version: 4, conversationHistory: [], folders: [], prompts: []}
      expect(isExportFormatV4(obj)).toBe(true)
    })

    it("should return false for non-v4 formats", () => {
      const obj = {version: 5, conversationHistory: [], folders: [], prompts: []}
      expect(isExportFormatV4(obj)).toBe(false)
    })
  })
})

describe("cleanData Functions", () => {
  describe("cleaning v4 data", () => {
    it("should return the latest format", () => {
      const data = {
        version: 4,
        conversationHistory: [
          {
            id: "1",
            name: "conversation 1",
            messages: [
              {
                role: "user",
                content: "what's up ?"
              },
              {
                role: "assistant",
                content: "Hi"
              }
            ],
            model: OpenAIModels[OpenAIModelID.GPT_3_5],
            prompt: OPENAI_DEFAULT_SYSTEM_PROMPT,
            temperature: OPENAI_DEFAULT_TEMPERATURE,
            folderId: null
          }
        ],
        folders: [
          {
            id: "1",
            name: "folder 1",
            type: "chat"
          }
        ],
        prompts: [
          {
            id: "1",
            name: "prompt 1",
            description: "",
            content: "",
            model: OpenAIModels[OpenAIModelID.GPT_3_5],
            folderId: null
          }
        ]
      } as ExportFormatV4

      const obj = convertOldDataFormatToNew(data)
      expect(isLatestExportFormat(obj)).toBe(true)
      expect(obj).toEqual({
        version: 4,
        conversationHistory: [
          {
            id: "1",
            name: "conversation 1",
            messages: [
              {
                role: "user",
                content: "what's up ?"
              },
              {
                role: "assistant",
                content: "Hi"
              }
            ],
            model: OpenAIModels[OpenAIModelID.GPT_3_5],
            prompt: OPENAI_DEFAULT_SYSTEM_PROMPT,
            temperature: OPENAI_DEFAULT_TEMPERATURE,
            folderId: null
          }
        ],
        folders: [
          {
            id: "1",
            name: "folder 1",
            type: "chat"
          }
        ],
        prompts: [
          {
            id: "1",
            name: "prompt 1",
            description: "",
            content: "",
            model: OpenAIModels[OpenAIModelID.GPT_3_5],
            folderId: null
          }
        ]
      })
    })
  })
})