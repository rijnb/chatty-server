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

import {Conversation} from "@/types/chat"
import {generateFilename} from "@/utils/app/filename"

const useSaveMarkdown = (conversation: Conversation) => {
  const onSaveMarkdown = () => {
    if (!conversation) {
      return
    }

    let markdownContent = `# ${conversation.name}\n\n(${new Date(conversation.time).toLocaleString()})\n\n`
    for (const message of conversation.messages) {
      markdownContent += `## ${message.role.charAt(0).toUpperCase() + message.role.slice(1)}

${
  typeof message.content === "string"
    ? message.content
    : message.content?.map((item) => (item.type === "text" ? item.text : "(Skipped image)")).join("\n")
}
`
    }

    const url = URL.createObjectURL(new Blob([markdownContent]))
    const link = document.createElement("a")
    link.download = generateFilename("markdown", "md")
    link.href = url
    link.style.display = "none"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return {onSaveMarkdown}
}

export default useSaveMarkdown
