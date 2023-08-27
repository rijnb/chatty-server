import {useTranslation} from "next-i18next"
import {useEffect, useMemo, useRef, useState} from "react"

import {Button, Dialog, FormDisclaimer, FormLabel, Input, TextArea} from "@/components/Styled"
import {Prompt} from "@/types/prompt"

interface Props {
  prompt: Prompt
  onClose: () => void
  onUpdatePrompt: (prompt: Prompt) => void
}

export const PromptEditModal = ({prompt, onClose, onUpdatePrompt}: Props) => {
  const {t} = useTranslation("common")
  const [name, setName] = useState(prompt.name)
  const [description, setDescription] = useState(prompt.description)
  const [content, setContent] = useState(prompt.content)
  const [factory] = useState(prompt.factory)

  const nameInputRef = useRef<HTMLInputElement>(null)

  const updatedPrompt = useMemo(
    () => ({...prompt, name, description, content, factory}),
    [prompt, name, description, content, factory]
  )

  const handleSubmit = () => {
    onUpdatePrompt(updatedPrompt)
  }

  useEffect(() => {
    nameInputRef.current?.focus()
  }, [])

  return (
    <Dialog onClose={onClose} onSubmit={handleSubmit} onClickAway={handleSubmit}>
      <FormLabel>{t("Name")}</FormLabel>
      <Input
        ref={nameInputRef}
        placeholder={t("A name for your prompt.")}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={(e) => setName(e.target.value)}
      />

      <FormLabel className="mt-2">{t("Description")}</FormLabel>
      <TextArea
        placeholder={t("A description for your prompt.")}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onBlur={(e) => setDescription(e.target.value)}
        rows={3}
      />

      <FormLabel className="mt-2">{t("Prompt")}</FormLabel>
      <TextArea
        placeholder={t(
          "Prompt content. Use {{}} to denote variables. For example: {{Translate this text}} {{Into this language}}"
        )}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={(e) => setContent(e.target.value)}
        rows={9}
      />

      <Button className="mt-2" onClick={handleSubmit}>
        {t("Save")}
      </Button>

      {prompt.factory && (
        <FormDisclaimer className="mt-2">
          {t(
            "This is factory prompt. If you edit and save it, a new user prompt will be created. The factory prompt cannot be edited or deleted."
          )}
        </FormDisclaimer>
      )}
    </Dialog>
  )
}

export default PromptEditModal
