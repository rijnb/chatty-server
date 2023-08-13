import React, {useEffect, useState} from "react"
import {useRouter} from "next/router"
import MemoizedReactMarkdown from "@/components/Markdown/MemoizedReactMarkdown"
import {ModalDialog} from "@/components/ModalDialog"

export interface Props {
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

export default function ReleaseNotes({close}: Props) {
  const {basePath} = useRouter()

  const releaseNotesMarkdown = useMarkdownFile(`${basePath}/RELEASE_NOTES.md`)

  return (
    <ModalDialog
      className="flex h-4/5 w-1/2 flex-col overflow-auto rounded-lg border bg-white p-8 dark:border-gray-700 dark:bg-[#202123]"
      onClose={close}
    >
      <button
        className="mb-2 w-fit rounded border border-neutral-200 bg-white px-4 py-2 text-black hover:opacity-50 dark:border-neutral-600 dark:bg-[#343541] dark:text-white"
        onClick={close}
      >
        Dismiss
      </button>
      <MemoizedReactMarkdown className="prose flex-1 dark:prose-invert">
        {`${releaseNotesMarkdown ? releaseNotesMarkdown : `Loading release notes...`}`}
      </MemoizedReactMarkdown>
      <button
        className="mt-2 w-fit rounded border border-neutral-200 bg-white px-4 py-2 text-black hover:opacity-50 dark:border-neutral-600 dark:bg-[#343541] dark:text-white"
        onClick={close}
      >
        Dismiss
      </button>
    </ModalDialog>
  )
}
