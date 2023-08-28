import {useState} from "react"

const useReleaseNotes = () => {
  const [isReleaseNotesDialogOpen, setIsReleaseNotesDialogOpen] = useState<boolean>(false)

  const openReleaseNotes = () => {
    setIsReleaseNotesDialogOpen(true)
  }

  const closeReleaseNotes = () => {
    setIsReleaseNotesDialogOpen(false)
  }

  return {isReleaseNotesDialogOpen, openReleaseNotes, closeReleaseNotes}
}
export default useReleaseNotes
