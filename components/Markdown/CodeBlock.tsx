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
import {IconCheck, IconClipboard, IconDownload} from "@tabler/icons-react"
import {useTranslation} from "next-i18next"
import {useTheme} from "next-themes"
import {memo, useState} from "react"
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter"
import {oneDark, oneLight} from "react-syntax-highlighter/dist/cjs/styles/prism"

import {programmingLanguages} from "@/utils/app/codeblock"
import {generateFilename} from "@/utils/app/filename"

interface Props {
  language: string
  value: string
}

export const CodeBlock = memo(({language, value}: Props) => {
  const {t} = useTranslation("common")
  const {theme} = useTheme()
  const [isCopied, setIsCopied] = useState<Boolean>(false)

  const handleCopyToClipboard = () => {
    if (!navigator.clipboard?.writeText) {
      return
    }
    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true)
      setTimeout(() => {
        setIsCopied(false)
      }, 2000)
    })
  }

  const handleDownloadAsFile = () => {
    const fileExtension = programmingLanguages[language] || ".txt"
    const fileName = `${generateFilename("code", fileExtension)}`
    const blob = new Blob([value], {type: "text/plain"})
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.download = fileName
    link.href = url
    link.style.display = "none"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className={"codeblock relative font-sans text-[16px]"}>
      <div
        className={`flex items-center justify-between px-4 py-1.5 ${
          theme === "dark" ? "codeblock-bar-dark" : "codeblock-bar-light"
        }`}
      >
        <span className="text-xs lowercase">{language}</span>

        <div className="flex items-center">
          <button className="flex items-center gap-1.5 rounded bg-none p-1 text-xs" onClick={handleCopyToClipboard}>
            {isCopied ? <IconCheck size={18} /> : <IconClipboard size={18} />}
            {isCopied ? t("Copied!") : t("Copy code")}
          </button>
          <button className="flex items-center rounded bg-none p-1 text-xs" onClick={handleDownloadAsFile}>
            <IconDownload size={18} />
          </button>
        </div>
      </div>

      <SyntaxHighlighter
        language={language}
        style={theme === "dark" ? oneDark : oneLight}
        customStyle={{margin: 0, paddingLeft: "1em", borderRadius: "0", fontSize: "small", overflow: "auto"}}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  )
})

CodeBlock.displayName = "CodeBlock"
export default CodeBlock
