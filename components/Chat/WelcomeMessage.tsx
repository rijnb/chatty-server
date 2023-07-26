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
          <div className="text-center text-4xl font-mono font-extrabold text-gray-700 dark:text-gray-100">
            <span className="text-red-500">CHATTY</span>&nbsp;
            <span className="text-orange-500">H</span>&nbsp;
            <span className="text-yellow-500">A</span>&nbsp;
            <span className="text-green-700">T</span>&nbsp;
            <span className="text-blue-700">T</span>&nbsp;
            <span className="text-indigo-700">Y</span>&nbsp;
          </div>
          <div className="text-center text-xl font-mono font-bold text-gray-800 dark:text-gray-400">
            Just a better interface for
            <p />
            Azure and OpenAI GPT-3/GPT-4
          </div>
          <div className="text-center text-gray-700 dark:text-gray-400">
            <div>&nbsp;</div>
            <div className="text-center text-gray-600 dark:text-gray-400">- = o O o = -</div>
            <div>&nbsp;</div>
            <div className="font-light">Chatty is 100% unaffiliated with OpenAI.</div>
            <div>&nbsp;</div>
            <div className="font-light">You can start chatting in the box below or</div>
            <div className="font-light">click on (?) in the top menu to read the release notes.</div>
          </div>
          <div className="text-center text-gray-600 dark:text-gray-400">- = o O o = -</div>
        </div>
      </div>
    </div>
  )
}