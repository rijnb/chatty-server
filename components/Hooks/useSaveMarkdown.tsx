import {Conversation} from "@/types/chat"
import {generateFilename} from "@/utils/app/filename"

const useSaveMarkdown = (conversation: Conversation) => {
  const onSaveMarkdown = () => {
    if (!conversation) {
      return
    }

    let markdownContent = `# ${conversation.name}\n\n(${new Date(conversation.time).toLocaleString()})\n\n`
    for (const message of conversation.messages) {
      markdownContent += `## ${message.role.charAt(0).toUpperCase() + message.role.slice(1)}\n\n${message.content}\n\n`
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
