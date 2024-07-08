import {useEffect, useState} from "react"

const useMarkdownFile = (filename: string) => {
  const [fileContent, setFileContent] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/file?filename=${filename}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.exists) {
          fetch(filename)
            .then((response) => (response.ok ? response.text() : ""))
            .then((text) => setFileContent(text))
        }
      })
      .catch((error) => console.info(`Error checking file existence: ${filename}, ${error}`))
  }, [filename])

  return fileContent
}

export default useMarkdownFile
