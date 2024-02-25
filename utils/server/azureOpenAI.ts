import OpenAI from "openai"
import {DefaultQuery, FinalRequestOptions, Headers} from "openai/core"

export interface AzureOpenAIOptions {
  baseURL: string
  apiKey: string
  apiVersion: string
}

class AzureOpenAI extends OpenAI {
  private readonly apiVersion: string

  constructor({baseURL, apiKey, apiVersion}: AzureOpenAIOptions) {
    super({baseURL, apiKey})
    this.apiVersion = apiVersion
  }

  protected authHeaders(opts: FinalRequestOptions): Headers {
    return {}
  }

  protected override defaultQuery(): DefaultQuery | undefined {
    return {
      ...super.defaultQuery(),
      "api-version": this.apiVersion
    }
  }

  protected override defaultHeaders(opts: FinalRequestOptions): Headers {
    return {
      ...super.defaultHeaders(opts),
      "api-key": this.apiKey
    }
  }
}

export default AzureOpenAI
