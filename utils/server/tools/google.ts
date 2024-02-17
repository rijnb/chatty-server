import {Readability} from "@mozilla/readability"
import endent from "endent"
import jsdom, {JSDOM} from "jsdom"

import {trimForPrivacy} from "@/utils/app/privacy"
import {BackendTool} from "@/utils/server/tools/index"

type GoogleSearchConfiguration = {
  apiKey: string
  cseId: string
}

type GoogleSearchArgs = {
  query: string
}

interface GoogleSource {
  title: string
  link: string
  displayLink: string
  snippet: string
  image: string
  text: string
}

const googleSearch: BackendTool<GoogleSearchConfiguration, GoogleSearchArgs> = {
  id: "googleSearch",
  type: "function",
  name: "Google Search",
  description: "Search the web with Google",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The search query"
      }
    },
    required: ["query"]
  },
  configuration_parameters: {
    type: "object",
    properties: {
      apiKey: {
        type: "string",
        description: "The Google API key"
      },
      cseId: {
        type: "string",
        description: "The Google Custom Search Engine ID"
      }
    },
    required: ["apiKey", "cseId"]
  },

  execute: runGoogleSearch,

  hasConfiguration: () => Boolean(process.env.GOOGLE_API_KEY && process.env.GOOGLE_CSE_ID),
  getConfiguration: () => ({
    apiKey: process.env.GOOGLE_API_KEY!,
    cseId: process.env.GOOGLE_CSE_ID!
  })
}

async function runGoogleSearch({apiKey, cseId}: GoogleSearchConfiguration, {query}: GoogleSearchArgs) {
  console.debug(`Google search, query:${trimForPrivacy(query)}`)
  const googleRes = await fetch(
    `https://customsearch.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${query}&num=5`
  )
  const googleData = await googleRes.json()
  const sources: GoogleSource[] = googleData.items.map((item: any) => ({
    title: item.title,
    link: item.link,
    displayLink: item.displayLink,
    snippet: item.snippet,
    image: item.pagemap?.cse_image?.[0]?.src,
    text: ""
  }))
  const sourcesWithText: any = await Promise.all(
    sources.map(async (source) => {
      try {
        console.debug(`Google search, get:${trimForPrivacy(source.link, 8)}`)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Google search request timed out")), 5000)
        )
        const res = (await Promise.race([fetch(source.link), timeoutPromise])) as any
        const html = await res.text()
        const virtualConsole = new jsdom.VirtualConsole()
        virtualConsole.on("error", (error) => {
          if (!error.message.includes("Could not parse CSS stylesheet")) {
            console.error(`Google search, error:${error}`)
          }
        })
        const dom = new JSDOM(html, {virtualConsole})
        const doc = dom.window.document
        const parsed = new Readability(doc).parse()
        if (parsed) {
          let sourceText = cleanSourceText(parsed.textContent)
          return {
            ...source,
            text: sourceText.slice(0, 3000)
          } as GoogleSource
        }
        return null
      } catch (error) {
        console.error(`Google search, error:${error}`)
        return null
      }
    })
  )
  const filteredSources: GoogleSource[] = sourcesWithText.filter(Boolean)

  return endent`
    Here is information requested. Cite the sources you used as a markdown link as you use them at the 
    end of each sentence by number of the source (example: [[1]](link.com)). Make sure the references
    are counted properly and are in order.

    Sources:
    ${filteredSources.map((source) => {
      return endent`
      ${source.title} (${source.link}):
      ${source.text}
      `
    })}
    `
}

// Clean up the source text from Google search results.
const cleanSourceText = (text: string) => {
  return text
    .trim()
    .replace(/(\n){4,}/g, "\n\n\n")
    .replace(/\n\n/g, " ")
    .replace(/ {3,}/g, "  ")
    .replace(/\t/g, "")
    .replace(/\n+(\s*\n)*/g, "\n")
}

export default googleSearch
