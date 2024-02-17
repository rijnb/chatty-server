import {IconKey} from "@tabler/icons-react"
import {JSONSchema} from "openai/src/lib/jsonschema"
import React, {useState} from "react"
import {useTranslation} from "react-i18next"

import SidebarButton from "@/components/Sidebar/SidebarButton"
import {Button, Dialog, FormHeader, FormLabel, FormText, Input} from "@/components/Styled"
import {useHomeContext} from "@/pages/api/home/home.context"
import {Tool} from "@/utils/app/tools"

export interface Props {
  tool: Tool
  onConfigurationChange: (configuration: any) => void
  onClearConfiguration: () => void
}

export const ToolConfiguration = ({tool, onConfigurationChange, onClearConfiguration}: Props) => {
  const {t} = useTranslation("common")

  const {
    state: {toolConfigurations}
  } = useHomeContext()

  const [isChanging, setIsChanging] = useState(false)

  const [formState, setFormState] = useState(toolConfigurations[tool.id] ?? {})

  const properties = tool.configuration_parameters.properties

  const handleChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({
      ...formState,
      [key]: e.target.value
    })
  }

  const onClose = () => {
    onConfigurationChange(formState)
    setIsChanging(false)
  }

  return (
    <>
      <SidebarButton text={t(tool.name)} icon={<IconKey size={18} />} onClick={() => setIsChanging(true)} />

      {isChanging && (
        <Dialog onClose={onClose} onClickAway={onClose}>
          <FormHeader>{tool.name}</FormHeader>
          <FormText>{tool.description}</FormText>

          {/*todo support only flat schema for simplicity*/}
          {properties &&
            Object.keys(properties).map((key) => (
              <div key={key}>
                <FormLabel className="mt-4">{(properties[key] as JSONSchema).description}</FormLabel>

                <Input type="password" value={formState[key] || ""} onChange={(e) => handleChange(key, e)} />
              </div>
            ))}

          <div className="mt-4 flex flex-row gap-3">
            <Button type="button" onClick={onClose}>
              {t("Save")}
            </Button>

            <Button
              onClick={() => {
                setFormState({})
                onClearConfiguration()
                setIsChanging(false)
              }}
            >
              Clear
            </Button>
          </div>
        </Dialog>
      )}
    </>
  )
}
