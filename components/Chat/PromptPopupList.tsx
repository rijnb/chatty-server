import {Prompt} from "@/types/prompt"
import {FC, MutableRefObject, useEffect, useRef, useState} from "react"

interface Props {
  prompts: Prompt[]
  activePromptIndex: number
  onSelect: () => void
  onMouseOver: (index: number) => void
  promptListRef: MutableRefObject<HTMLUListElement | null>
}

export const PromptPopupList: FC<Props> = ({prompts, activePromptIndex, onSelect, onMouseOver, promptListRef}) => {
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeout = useRef<NodeJS.Timeout>()

  const handleScroll = () => {
    setIsScrolling(true)
    clearTimeout(scrollTimeout.current)
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false)
    }, 250)
  }

  useEffect(() => {
    let ref = promptListRef.current
    ref?.addEventListener("scroll", handleScroll)
    return () => {
      ref?.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
      <ul
          ref={promptListRef}
          className="z-10 max-h-52 w-full overflow-scroll rounded border border-black/10 bg-white shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:border-neutral-500 dark:bg-[#343541] dark:text-white dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]"
      >
        {prompts.map((prompt, index) => (   // Do not sort the prompts, the selection is index-based.
            <li
                key={prompt.id}
                className={`${
                    index === activePromptIndex ? "bg-gray-200 dark:bg-[#202123] dark:text-black" : ""
                } cursor-pointer px-3 py-2 text-sm text-black dark:text-white`}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onSelect()
                }}
                onMouseEnter={() => {
                  if (!isScrolling) {
                    onMouseOver(index)
                  }
                }}
            >
              {prompt.name}
            </li>
        ))}
      </ul>
  )
}

export default PromptPopupList