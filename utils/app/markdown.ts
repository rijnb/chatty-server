import {useEffect, useState} from "react"

const useMarkdownFile = (filename: string) => {
  const [fileContent, setFileContent] = useState<string | null>(null)

  useEffect(() => {
    fetch(filename)
      .then((response) => (response.ok ? response.text() : ""))
      .then((text) => setFileContent(text))
      .catch((error) => console.info(`Cannot read Markdown file: ${filename}, ${error}`))
  }, [filename])
  return fileContent
}

export default useMarkdownFile
