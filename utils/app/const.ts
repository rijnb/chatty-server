import {FALLBACK_OPENAI_MODEL} from "@/types/openai"

/**
 * The default system prompt is sent for every conversation. It sets the context for the conversation.
 * We want Chatty to respond in Markdown, with clearly formatted code examples, if applicable.
 */
export const OPENAI_DEFAULT_SYSTEM_PROMPT =
  process.env.OPENAI_DEFAULT_SYSTEM_PROMPT ??
  "You are Chatty, a large conversational model based on ChatGPT. Always follow the user's instructions carefully. If you provide code examples in Markdown, include the language. Provide formulas in LaTeX style. LaTeX formulas must be preceded and followed by a line with just $$. Inline formulas are placed in $...$). Do not put LaTeX formulas in a code block."

// The default temperature is used to control the randomness of the model's responses; range "0.0" to "1.0" (as string).
export const OPENAI_DEFAULT_TEMPERATURE = parseFloat(process.env.OPENAI_DEFAULT_TEMPERATURE ?? "0.8")

// The API type; "openai" or "azure".
export const OPENAI_API_TYPE = process.env.OPENAI_API_TYPE ?? "openai"

// The host URI; for OpenAI only.
export const OPENAI_API_HOST = process.env.OPENAI_API_HOST ?? "https://api.openai.com"

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

// Other constants.
export const NEW_CONVERSATION_TITLE = "New conversation"
