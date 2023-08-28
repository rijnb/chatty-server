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
