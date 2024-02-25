import {APIError, AuthenticationError, BadRequestError, OpenAIError, RateLimitError} from "openai/error"

export class StreamingError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export class GenericOpenAIError extends StreamingError {
  type: string
  param: string
  code: string

  constructor(message: string, type: string, param: string, code: string) {
    super(message)
    this.type = type
    this.param = param
    this.code = code
  }
}

export class OpenAIAuthError extends StreamingError {
  constructor(message: string) {
    super(message)
  }
}

export class OpenAIRateLimited extends StreamingError {
  retryAfterSeconds?: number

  constructor(message: string, retryAfterSeconds?: number) {
    super(message)
    this.retryAfterSeconds = retryAfterSeconds
  }
}

export class OpenAILimitExceeded extends StreamingError {
  limit?: number
  requested?: number

  constructor(message: string, limit?: number, requested?: number) {
    super(message)
    this.limit = limit
    this.requested = requested
  }
}

export function transformError(error: OpenAIError): StreamingError {
  if (error instanceof APIError) {
    return handleApiError(error)
  }

  return error
}

function handleApiError(apiError: APIError): StreamingError {
  if (apiError instanceof AuthenticationError) {
    /*
    normal OpenAI errors body is '{"error": {"code":..., "message":..., "type":..., "param":...}}'
    except for 401 for azure, which is just '{"statusCode": 401, "message": "...."}'
    which openai-node fails to parse
     */
    return new OpenAIAuthError(
      "Access denied due to invalid subscription key. Make sure to provide a valid key for an active subscription."
    )
  }

  const details = apiError.error as any

  if (apiError instanceof RateLimitError) {
    const match = details.message.match(/retry.* (\d+) sec/)
    const retryAfter = match ? parseInt(match[1]) : undefined
    return new OpenAIRateLimited(details.message, retryAfter)
  }

  if (apiError instanceof BadRequestError) {
    switch (details.code) {
      case "context_length_exceeded":
        const match = details.message.match(/max.*length.* (\d+) tokens.*requested (\d+) tokens/)
        const limit = match ? parseInt(match[1]) : undefined
        const requested = match ? parseInt(match[2]) : undefined

        return new OpenAILimitExceeded(details.message, limit, requested)
    }
  }

  return new GenericOpenAIError(details.message, details.type, details.param, details.code)
}

export function reconstructError(errorObj: any): StreamingError {
  if (!errorObj || !errorObj.name) {
    console.log("Unknown error", errorObj)
    return new StreamingError("Unknown error")
  }

  switch (errorObj.name) {
    case "OpenAIAuthError":
      return new OpenAIAuthError(errorObj.message)
    case "OpenAIRateLimited":
      return new OpenAIRateLimited(errorObj.message, errorObj.retryAfterSeconds)
    case "OpenAILimitExceeded":
      return new OpenAILimitExceeded(errorObj.message, errorObj.limit, errorObj.requested)
    case "GenericOpenAIError":
      return new GenericOpenAIError(errorObj.message, errorObj.type, errorObj.param, errorObj.code)
    default:
      console.log("Unknown error", errorObj)
      return new StreamingError("Unknown error")
  }
}
