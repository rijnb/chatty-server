import {ChatBody} from "./chat"

export interface GoogleBody extends ChatBody {
  googleAPIKey: string
  googleCSEId: string
}

export interface GoogleSource {
  title: string
  link: string
  displayLink: string
  snippet: string
  image: string
  text: string
}
