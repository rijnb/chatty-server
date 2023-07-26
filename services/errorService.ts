import {useMemo} from "react"

import {useTranslation} from "next-i18next"

import {ErrorMessage} from "@/types/error"


const useErrorService = () => {
  const {t} = useTranslation("chat")

  return {
    getModelsError: useMemo(
      () => (error: any) => {
        return !error
          ? null
          : ({
              title: t("Error fetching conversation models."),
              code: error.status || "unknown",
              messageLines: error.statusText
                ? [error.statusText]
                : [
                    t("Make sure your OpenAI API key and unlock codes are set in the left of the sidebar."),
                    t("If you completed this step and the problems persists, the server may be experiencing issues.")
                  ]
            } as ErrorMessage)
      },
      [t]
    )
  }
}

export default useErrorService