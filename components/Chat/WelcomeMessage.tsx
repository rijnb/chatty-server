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
import Image from "next/image"
import {useRouter} from "next/router"
import React from "react"

import MemoizedReactMarkdown from "@/components/Markdown/MemoizedReactMarkdown"
import useMarkdownFile from "@/utils/app/markdown"

export interface Props {}

export const WelcomeMessage = ({}: Props) => {
  const {basePath} = useRouter()
  const welcomeMessageMarkdown = useMarkdownFile(`${basePath}/welcome-message.md`)

  return (
    <div className="mx-auto flex flex-col space-y-5 px-3 pt-5 md:space-y-10 md:pt-20">
      <div className="relative flex-1 overflow-hidden bg-white dark:bg-[#343541]">
        <div className="text-center text-gray-700 dark:text-gray-400">
          <div className="mx-auto flex flex-col justify-center space-y-4 sm:w-[600px]">
            <div className="text-center text-5xl font-extrabold text-gray-700 dark:text-gray-100">
              <span className="text-red-500">C</span>&nbsp;
              <span className="text-orange-500">H</span>&nbsp;
              <span className="text-yellow-500">A</span>&nbsp;
              <span className="text-green-700">T</span>&nbsp;
              <span className="text-blue-700">T</span>&nbsp;
              <span className="text-indigo-700">Y</span>&nbsp;
            </div>
            <div className="text-center text-xl font-bold text-gray-800 dark:text-gray-400">
              A conversational interface for
              <p />
              Azure and OpenAI GPT-3/GPT-4 models
            </div>
          </div>
          <div className="mx-auto mt-10 flex flex-col justify-center space-y-4 sm:w-[600px]">
            <MemoizedReactMarkdown className="prose flex-1 text-left dark:prose-invert">{`${
              welcomeMessageMarkdown ?? ""
            }`}</MemoizedReactMarkdown>
          </div>

          {!welcomeMessageMarkdown && (
            <div className="mx-auto flex flex-col justify-center space-y-4 sm:w-[600px]">
              <div className="text-center text-gray-700 dark:text-gray-400">
                <div>&nbsp;</div>
                <Image
                  src={`${basePath}/icon-256.png`}
                  height="256"
                  width="256"
                  alt="icon"
                  className="mx-auto mb-6 h-24 w-24"
                />
                <div>&nbsp;</div>
                <div className="font-light">You can start chatting in the box below.</div>
                <div className="font-light">Click on [ ? ] in the top menu for instructions and release notes.</div>
              </div>
              <div className="text-center text-gray-600 dark:text-gray-400">- = o O o = -</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WelcomeMessage
