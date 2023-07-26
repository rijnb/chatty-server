import {FC, useContext} from "react"

import HomeContext from "@/pages/api/home/home.context"

export interface Props {}

export const WelcomeMessage: FC<Props> = () => {
  const {
    state: {apiKey, unlockCode, serverSideApiKeyIsSet, serverSideUnlockCodeIsSet},
    dispatch: homeDispatch
  } = useContext(HomeContext)

  return (
    <div className="mx-auto flex flex-col space-y-5 md:space-y-10 px-3 pt-5 md:pt-12">
      <div className="relative flex-1 overflow-hidden bg-white dark:bg-[#343541]">
        <div className="mx-auto flex flex-col justify-center space-y-6 sm:w-[600px]">
          <div className="text-center text-4xl font-bold text-blue-800 dark:text-blue-400">CHATTY</div>
          <div className="text-center text-xl font-bold text-yellow-700 dark:text-yellow-100">
            A better interface for OpenAI GPT-3/GPT-4
          </div>
          <div className="text-center text-gray-700 dark:text-gray-400">
            <div className="mb-2 text-gray-800 dark:text-gray-200">Chatty was developed by Rijn Buve.</div>
            Chatty is 100% unaffiliated with OpenAI. It is based on <span className="italic"> chatbot-ui </span>
            by Mckay Wrigley and includes features from many contributors.
          </div>
          <div className="text-center text-gray-600 dark:text-gray-400">- = o O o = -</div>
        </div>
      </div>
    </div>
  )
}
