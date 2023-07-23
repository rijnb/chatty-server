import {FC, useContext} from "react"

import HomeContext from "@/pages/api/home/home.context"

import PromptbarContext from "@/components/Promptbar/PromptBar.context"

import {ClearPrompts} from "./ClearPrompts"

interface Props {}

export const PromptbarSettings: FC<Props> = () => {
  const {
    state: {prompts},
    dispatch: homeDispatch
  } = useContext(HomeContext)

  const {handleClearPrompts} = useContext(PromptbarContext)

  return (
    <div>
      {prompts.length > 0 ? (
        <ClearPrompts onClearPrompts={handleClearPrompts} />
      ) : ""}
    </div>
  )
}
