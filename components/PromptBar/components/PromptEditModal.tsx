/*
 * Copyright (C) 2024, Rijn Buve.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions
 * of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import { useTranslation } from "next-i18next";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";



import { Button, Dialog, FormDisclaimer, FormLabel, Input, TextArea } from "@/components/Styled";
import { Prompt } from "@/types/prompt";


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
        onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
        onBlur={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
      />

      <FormLabel className="mt-2">{t("Description")}</FormLabel>
      <TextArea
        placeholder={t("A description for your prompt.")}
        value={description}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
        onBlur={(e: ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
        rows={3}
      />

      <FormLabel className="mt-2">{t("Prompt")}</FormLabel>
      <TextArea
        placeholder={t(
          "Use {{...}} to specify one or more prompt variables. For example:\n\n| Translate: {{Paste your text}} \n| Into this language: {{Specify target language}}\n\nThis will show 2 input boxes, one for the text and one for the target language. If you specify {{#DROP}} as the last parameter, a drop zone for files to be read is shown."
        )}
        value={content}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setContent(e.target.value)}
        onBlur={(e: ChangeEvent<HTMLInputElement>) => setContent(e.target.value)}
        rows={9}
      />

      <Button className="mt-2" onClick={handleSubmit}>
        {t("Save")}
      </Button>

      {prompt.factory && (
        <FormDisclaimer className="mt-2 text-red-400">
          {t(
            "This is a factory prompt. A factory prompt cannot be edited or deleted. If you save it, a new user prompt will be created instead."
          )}
        </FormDisclaimer>
      )}
    </Dialog>
  )
}

export default PromptEditModal
