import {useRouter} from "next/router"
import React, {useEffect, useState} from "react"

import MemoizedReactMarkdown from "@/components/Markdown/MemoizedReactMarkdown"
import {ModalDialog} from "@/components/ModalDialog"
import {Button} from "@/components/Styled"

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

export const ReleaseNotes = ({close}: Props) => {
  const {basePath} = useRouter()

  const releaseNotesMarkdown = useMarkdownFile(`${basePath}/RELEASE_NOTES.md`)

  return (
    <ModalDialog
      className="flex h-4/5 w-1/2 flex-col overflow-auto rounded-lg border bg-white p-8 dark:border-gray-700 dark:bg-[#202123]"
      onClose={close}
    >
      <MemoizedReactMarkdown className="prose flex-1 dark:prose-invert">
        {`${releaseNotesMarkdown ? releaseNotesMarkdown : `Loading release notes...`}`}
      </MemoizedReactMarkdown>
      <Button onClick={close}>Dismiss</Button>
    </ModalDialog>
  )
}

export default ReleaseNotes
