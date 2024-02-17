import React, {useRef} from "react"
import Select from "react-select"

import useClickAway from "@/components/Hooks/useClickAway"
import {Tool} from "@/utils/app/tools"
import {ToolId} from "@/utils/server/tools"

interface Props {
  tools: Tool[]
  selectedTools: ToolId[]
  onSelectionChange: (selectedTools: ToolId[]) => void
  onClose: () => void
}

export const ToolSelect = ({tools, selectedTools, onSelectionChange, onClose}: Props) => {
  const ref = useRef<HTMLDivElement>(null)

  useClickAway(ref, true, () => {
    onClose()
  })

  const options = tools.map((t) => ({value: t.id, label: t.name}))
  return (
    <div ref={ref} className="mb-1 w-full pr-2 text-neutral-900 dark:border-neutral-600 dark:text-white">
      <Select
        closeMenuOnSelect={false}
        options={options}
        defaultValue={options.filter((o) => selectedTools.includes(o.value))}
        isMulti
        onChange={(selected) => {
          onSelectionChange(selected.map((s) => s.value))
        }}
      />
    </div>
  )
}

export default ToolSelect
