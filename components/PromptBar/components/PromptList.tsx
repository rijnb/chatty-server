import PromptListItem from "./PromptListItem"
import {Prompt} from "@/types/prompt"

interface Props {
  prompts: Prompt[]
}

export const PromptList = ({prompts}: Props) => {
  return (
    <div className="flex w-full flex-col gap-1">
      {prompts
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((prompt, index) => (
          <PromptListItem key={index} prompt={prompt} />
        ))}
    </div>
  )
}

export default PromptList
