import React, {useEffect, useState} from "react"
import Modal from "react-modal"
import {useRouter} from "next/router"
import MemoizedReactMarkdown from "@/components/Markdown/MemoizedReactMarkdown"


export interface Props {
  isOpen: boolean
  close: () => void
}

const useMarkdownFile = (filename: string) => {
  const [fileContent, setFileContent] = useState<string | null>(null)

  useEffect(() => {
    fetch(filename)
      .then((response) => response.text())
      .then((text) => setFileContent(text))
      .catch((error) => console.error(`Error fetching markdown file, error:${error}`))
  }, [filename])
  return fileContent
}

export default function ReleaseNotes({isOpen, close}: Props) {
  const {basePath} = useRouter()

  const releaseNotesMarkdown = useMarkdownFile(`${basePath}/RELEASE_NOTES.md`)

  const customModalStyles = {
    content: {
      backgroundColor: "#e6e6e0",
      color: "#000000",
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      padding: "2rem",
      maxWidth: "50%",
      maxHeight: "80%",
      overflow: "auto"
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)"
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={close}
      style={customModalStyles}
      contentLabel="Release Notes"
      ariaHideApp={false}
    >
      <button
          className="h-[40px] rounded-md bg-blue-500 px-4 py-1 text-sm font-medium text-white enabled:hover:bg-blue-600 disabled:opacity-50"
          onClick={close}
      >
        Dismiss
      </button>
      <MemoizedReactMarkdown className="prose flex-1 dark:prose-invert text-black">
        {`${releaseNotesMarkdown ? releaseNotesMarkdown : `Loading release notes...`}`}
      </MemoizedReactMarkdown>
      <button
        className="h-[40px] rounded-md bg-blue-500 px-4 py-1 text-sm font-medium text-white enabled:hover:bg-blue-600 disabled:opacity-50"
        onClick={close}
      >
        Dismiss
      </button>
    </Modal>
  )
}