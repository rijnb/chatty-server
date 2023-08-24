/**
 * The default system prompt is sent for every conversation. It sets the context for the conversation.
 * We want Chatty to respond in Markdown, with clearly formatted code examples, if applicable.
 */
export const OPENAI_DEFAULT_SYSTEM_PROMPT =
  process.env.OPENAI_DEFAULT_SYSTEM_PROMPT ||
  "You are Chatty, a large conversational model based on ChatGPT. Follow the user's instructions carefully. Respond using markdown. If you provide code examples, always include the language."

export const OPENAI_DEFAULT_TEMPERATURE = parseFloat(process.env.OPENAI_DEFAULT_TEMPERATURE || "0.8")
export const OPENAI_API_TYPE = process.env.OPENAI_API_TYPE || "openai"
export const OPENAI_API_HOST = process.env.OPENAI_API_HOST || "https://api.openai.com"
export const OPENAI_API_VERSION = process.env.OPENAI_API_VERSION || "2023-03-15-preview"
export const OPENAI_API_MAX_TOKENS = parseInt(process.env.OPENAI_MAX_TOKENS || "1000")
export const OPENAI_ORGANIZATION = process.env.OPENAI_ORGANIZATION || ""
export const OPENAI_AZURE_DEPLOYMENT_ID = process.env.OPENAI_AZURE_DEPLOYMENT_ID || ""

// Other constants.
export const NEW_CONVERSATION_TITLE = "New conversation"
