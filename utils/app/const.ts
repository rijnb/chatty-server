import {FALLBACK_OPENAI_MODEL} from "@/types/openai"

/**
 * The default system prompt is sent for every conversation. It sets the context for the conversation.
 * We want Chatty to respond in Markdown, with clearly formatted code examples, if applicable.
 */
export const OPENAI_DEFAULT_SYSTEM_PROMPT =
  process.env.OPENAI_DEFAULT_SYSTEM_PROMPT ??
  "You are Chatty, a chatbot that helps users with their questions. Always follow the user's instructions carefully. If you provide code examples in Markdown, include the language. You will use tools available to find relevant information or complete tasks. You will be smart in your research. If the search does not come back with the answer, rephrase the question and try again. Review the result of the search and use it to guide your next search if needed."

export const OPENAI_DEFAULT_TEMPERATURE = parseFloat(process.env.OPENAI_DEFAULT_TEMPERATURE ?? "0.8")
export const OPENAI_API_TYPE = process.env.OPENAI_API_TYPE ?? "openai"
export const OPENAI_API_HOST = process.env.OPENAI_API_HOST ?? "https://api.openai.com"
export const OPENAI_API_VERSION = process.env.OPENAI_API_VERSION ?? "2023-03-15-preview"
export const OPENAI_API_MAX_TOKENS = parseInt(process.env.OPENAI_MAX_TOKENS ?? "1000")
export const OPENAI_ORGANIZATION = process.env.OPENAI_ORGANIZATION ?? ""
export const OPENAI_AZURE_DEPLOYMENT_ID = process.env.OPENAI_AZURE_DEPLOYMENT_ID ?? ""
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? ""
export const OPENAI_DEFAULT_MODEL = process.env.OPENAI_DEFAULT_MODEL ?? FALLBACK_OPENAI_MODEL
export const OPENAI_REUSE_MODEL = parseInt(process.env.OPENAI_REUSE_MODEL ?? "0") != 0

// Other constants.
export const NEW_CONVERSATION_TITLE = "New conversation"
