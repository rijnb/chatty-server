/*
 * Copyright (C) 2024, Rijn Buve.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions
 * of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
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
