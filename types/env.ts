export interface ProcessEnv {
  OPENAI_API_KEY: string
  OPENAI_API_HOST?: string
  OPENAI_API_TYPE?: "openai" | "azure"
  OPENAI_API_VERSION?: string
  OPENAI_ORGANIZATION?: string
  OPENAI_API_MAX_TOKENS?: string
  OPENAI_DEFAULT_SYSTEM_PROMPT?: string
  OPENAI_DEFAULT_TEMPERATURE?: string
  OPENAI_DEFAULT_MODEL?: string
  OPENAI_AZURE_DEPLOYMENT_ID?: string
  OPENAI_UNLOCK_CODE?: string
  GOOGLE_API_KEY?: string
  GOOGLE_CSE_ID?: string
}
