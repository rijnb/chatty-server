import {AppInsightsContext} from "@microsoft/applicationinsights-react-js"
import {appWithTranslation} from "next-i18next"
import {ThemeProvider} from "next-themes"
import type {AppContext, AppInitialProps, AppProps} from "next/app"
import App from "next/app"
import {PT_Sans} from "next/font/google"
import {Toaster} from "react-hot-toast"
import {QueryClient, QueryClientProvider} from "react-query"

import {reactPlugin} from "@/components/ApplicationInsights/AppInsightsConfig"
import {UnlockProvider} from "@/components/UnlockCode"
import "@/styles/globals.css"

const inter = PT_Sans({subsets: ["latin"], weight: ["400", "700"]})

type ChattyAppProps = {
  isProtected: boolean
}

function ChattyApp({Component, pageProps, isProtected}: AppProps & ChattyAppProps) {
  const queryClient = new QueryClient()

  return (
    <div className={inter.className}>
      <Toaster />
      <AppInsightsContext.Provider value={reactPlugin}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="dark">
            <UnlockProvider isProtected={isProtected}>
              <Component {...pageProps} />
            </UnlockProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </AppInsightsContext.Provider>
    </div>
  )
}

ChattyApp.getInitialProps = async (context: AppContext): Promise<ChattyAppProps & AppInitialProps> => {
  const ctx = await App.getInitialProps(context)
  return {...ctx, isProtected: !!process.env.OPENAI_UNLOCK_CODE}
}

export default appWithTranslation(ChattyApp)
