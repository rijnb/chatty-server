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
import {toPng} from "html-to-image"
import React from "react"

import {generateFilename} from "@/utils/app/filename"

const useScreenshot = (container: React.RefObject<HTMLDivElement>) => {
  const onSaveScreenshot = () => {
    if (container.current === null) {
      return
    }

    container.current.classList.remove("max-h-full")
    toPng(container.current, {cacheBust: true})
      .then((dataUrl) => {
        const link = document.createElement("a")
        link.download = `${generateFilename("screenshot", "png")}`
        link.href = dataUrl
        link.click()
        if (container.current) {
          container.current.classList.add("max-h-full")
        }
      })
      .catch((error) => {
        console.warn(`Error saving images: ${error}`)
      })
  }

  return {onSaveScreenshot}
}

export default useScreenshot
