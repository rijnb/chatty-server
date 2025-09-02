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
import {FALLBACK_OPENAI_MODEL} from "@/types/openai"

/**
 * The default system prompt is sent for every conversation. It sets the context for the conversation.
 * We want Chatty to respond in Markdown, with clearly formatted code examples, if applicable.
 */
export const OPENAI_DEFAULT_SYSTEM_PROMPT =
  process.env.OPENAI_DEFAULT_SYSTEM_PROMPT ??
  "You are called Chatty. If you provide code examples in Markdown, include the language. Format formulas LaTeX style, preceded and followed by a line with just $$. Inline formulas must be placed in in dollar signs such as $E=mc^2$. Again, place inline formulas in $...$, delimited by single dollar signs. Never put LaTeX formulas in a code block. If ask a question about code, just provide the code, unless I ask for detailed explanations."

// The default temperature is used to control the randomness of the model's responses; range "0.0" to "1.0" (as string).
export const OPENAI_DEFAULT_TEMPERATURE = parseFloat(process.env.OPENAI_DEFAULT_TEMPERATURE ?? "0.8")

// The API type; "openai" or "azure".
export const OPENAI_API_TYPE = process.env.OPENAI_API_TYPE ?? "openai"

// The API key for the primary host.
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? ""

// The API key for the backup host.
export const OPENAI_API_KEY_BACKUP = process.env.OPENAI_API_KEY_BACKUP ?? OPENAI_API_KEY

// The primary host URI.
export const OPENAI_API_HOST = process.env.OPENAI_API_HOST ?? "https://api.openai.com"

// The backup host URI.
export const OPENAI_API_HOST_BACKUP = process.env.OPENAI_API_HOST_BACKUP ?? OPENAI_API_HOST

// The API version.
export const OPENAI_API_VERSION = process.env.OPENAI_API_VERSION ?? "2023-03-15-preview"

// The maximum number of tokens to send to OpenAI.
export const OPENAI_API_MAX_TOKENS = parseInt(process.env.OPENAI_MAX_TOKENS ?? "1000")

// The organization ID; for OpenAI only.
export const OPENAI_ORGANIZATION = process.env.OPENAI_ORGANIZATION ?? ""

// The Azure deployment ID; for Azure only.
export const OPENAI_AZURE_DEPLOYMENT_ID = process.env.OPENAI_AZURE_DEPLOYMENT_ID ?? ""

// The default model to use if the user's model is not supported.
export const OPENAI_DEFAULT_MODEL = process.env.OPENAI_DEFAULT_MODEL ?? FALLBACK_OPENAI_MODEL

// Whether to reuse the model for new conversations; true or false.
export const OPENAI_REUSE_MODEL = (process.env.OPENAI_REUSE_MODEL && process.env.OPENAI_REUSE_MODEL == "true") ?? false

// Whether to allow selecting another model; true or false.
export const OPENAI_ALLOW_MODEL_SELECTION =
  (process.env.OPENAI_ALLOW_MODEL_SELECTION && process.env.OPENAI_ALLOW_MODEL_SELECTION == "true") ?? false

export const OPENAI_DEFAULT_REASONING_EFFORT = process.env.OPENAI_DEFAULT_REASONING_EFFORT ?? "medium"

// Other constants.
export const NEW_CONVERSATION_TITLE = "New conversation"
export const SWITCH_BACK_TO_PRIMARY_HOST_TIMEOUT_MS = 5 * 60 * 1000
