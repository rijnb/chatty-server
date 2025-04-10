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
import {useRouter} from "next/router"

import MemoizedReactMarkdown from "@/components/Markdown/MemoizedReactMarkdown"
import {ModalDialog} from "@/components/ModalDialog"
import {Button} from "@/components/Styled"
import useMarkdownFile from "@/utils/app/markdown"

export interface Props {
  close: () => void
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
        {`${releaseNotesMarkdown ?? "Loading release notes..."}`}
      </MemoizedReactMarkdown>
      <Button onClick={close}>Dismiss</Button>
    </ModalDialog>
  )
}

export default ReleaseNotes
