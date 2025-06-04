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
import {useTranslation} from "next-i18next"
import {useMemo} from "react"

import {ErrorMessage} from "@/types/error"

const useErrorService = () => {
  const {t} = useTranslation("common")

  return {
    getModelsError: useMemo(
      () => (error: any) => {
        return !error
          ? null
          : ({
            title: t("Oops. There's a problem talking to the OpenAI server..."),
            code: error.status || "unknown",
            messageLines:
              [
                t("I'm sorry... I can't seem to retrieve information about"),
                t("the OpenAI models from the server."),
                t("-"),
                t("If you are using an OpenAI API key, or an Unlock code,"),
                t("please make sure it is entered correctly in the left sidebar."),
                t("-"),
                t("Or perhaps the server is down for a moment, and you need to"),
                t("wait until it's back up again. Anyway, I'm afraid there's not"),
                t("much more I can do to help at this moment."),
                t("-"),
                t("The message I got back from the server was:"),
                "'" + error.statusText + "'"
              ]
          } as ErrorMessage)
      },
      [t]
    )
  }
}

export default useErrorService
