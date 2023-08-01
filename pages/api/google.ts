import {NextApiRequest, NextApiResponse} from "next"
import {
  OPENAI_API_HOST,
  OPENAI_API_TYPE,
  OPENAI_API_VERSION,
  OPENAI_AZURE_DEPLOYMENT_ID,
  OPENAI_ORGANIZATION
} from "@/utils/app/const"
import {trimForPrivacy} from "@/utils/app/privacy"
import {cleanSourceText} from "@/utils/server/google"
import {Message} from "@/types/chat"
import {GoogleBody, GoogleSource} from "@/types/google"
import {Readability} from "@mozilla/readability"
import endent from "endent"
import jsdom, {JSDOM} from "jsdom"


const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const {messages, key, model, googleAPIKey, googleCSEId} = req.body as GoogleBody
    if (messages.length === 0) {
      return res.status(200).json("No query was entered...")
    }
    const userMessage = messages[messages.length - 1].content.trim()
    const query = encodeURIComponent(userMessage)

    console.info(`[Google search] ${trimForPrivacy(userMessage)}`)
    const googleRes = await fetch(
      `https://customsearch.googleapis.com/customsearch/v1?key=${
        googleAPIKey ? googleAPIKey : process.env.GOOGLE_API_KEY
      }&cx=${googleCSEId ? googleCSEId : process.env.GOOGLE_CSE_ID}&q=${query}&num=5`
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
          console.info(`[Google search] get URL '${trimForPrivacy(source.link, 8)}'`)
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Google search request timed out")), 5000)
          )
          const res = (await Promise.race([fetch(source.link), timeoutPromise])) as any
          const html = await res.text()
          const virtualConsole = new jsdom.VirtualConsole()
          virtualConsole.on("error", (error) => {
            if (!error.message.includes("Could not parse CSS stylesheet")) {
              console.error(`[Google search] ${error}`)
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
          console.error(`[Google search] ${error}`)
          return null
        }
      })
    )
    const filteredSources: GoogleSource[] = sourcesWithText.filter(Boolean)
    const answerPrompt = endent`
    Provide me with the information I requested. Use the sources to provide an accurate response.
    Respond in markdown format. Cite the sources you used as a markdown link as you use them at the 
    end of each sentence by number of the source (example: [[1]](link.com)). 
    Provide an accurate response and then stop. Maximum 10 sentences. 
    Today's date is ${new Date().toLocaleDateString()}.

    Example Input:
    What's the weather in San Francisco today?

    Example Sources:
    [Weather in San Francisco](https://www.google.com/search?q=weather+san+francisco)

    Example Response:
    It's 70 degrees and sunny in San Francisco today. [[1]](https://www.google.com/search?q=weather+san+francisco)

    Input:
    ${userMessage}

    Sources:
    ${filteredSources.map((source) => {
      return endent`
      ${source.title} (${source.link}):
      ${source.text}
      `
    })}

    Response:
    `
    const answerMessage: Message = {role: "user", content: answerPrompt}

    let url = `${OPENAI_API_HOST}/v1/chat/completions?api-version=${OPENAI_API_VERSION}`
    if (OPENAI_API_TYPE === "azure") {
      url = `${OPENAI_API_HOST}/openai/deployments/${OPENAI_AZURE_DEPLOYMENT_ID}/chat/completions?api-version=${OPENAI_API_VERSION}`
    }
    console.info(`[Google search] POST result to ${OPENAI_API_TYPE}`)
    const answerRes = await fetch(`${url}`, {
      headers: {
        "Content-Type": "application/json",
        ...(OPENAI_API_TYPE === "openai" && {
          Authorization: `Bearer ${key ? key : process.env.OPENAI_API_KEY}`
        }),
        ...(OPENAI_API_TYPE === "azure" && {
          "api-key": `${key ? key : process.env.OPENAI_API_KEY}`
        }),
        ...(OPENAI_API_TYPE === "openai" &&
          OPENAI_ORGANIZATION && {
            "OpenAI-Organization": OPENAI_ORGANIZATION
          })
      },
      method: "POST",
      body: JSON.stringify({
        model: model.id,
        messages: [answerMessage],
        max_tokens: 1000,
        temperature: 1,
        stream: false
      })
    })
    const {choices} = await answerRes.json()
    const answer = choices[0].message.content
    console.info(`[Google search] Got result: ${trimForPrivacy(answer)}`)
    res.status(200).json({answer})
  } catch (error) {
    console.error(`[Google search] Error: ${error}`)
    res.status(500).json({error: "Google search error"})
  }
}

export default handler
