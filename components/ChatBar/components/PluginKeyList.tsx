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
import {IconKey} from "@tabler/icons-react"
import React, {ChangeEvent, useContext, useState} from "react"
import {useTranslation} from "react-i18next"

import ChatBarContext from "@/components/ChatBar/ChatBar.context"
import SidebarButton from "@/components/Sidebar/SidebarButton"
import {Button, Dialog, FormHeader, FormLabel, FormText, Input} from "@/components/Styled"
import {useHomeContext} from "@/pages/api/home/home.context"
import {PluginID} from "@/types/plugin"

export const PluginKeyList = () => {
  const {t} = useTranslation("common")

  const {
    state: {pluginKeys}
  } = useHomeContext()
  const {handlePluginKeyChange, handleClearPluginKey} = useContext(ChatBarContext)

  const [isChanging, setIsChanging] = useState(false)

  const [googleApiKey, setGoogleApiKey] = useState(findKey("GOOGLE_API_KEY")?.value ?? "")
  const [googleCseId, setGoogleCseId] = useState(findKey("GOOGLE_CSE_ID")?.value ?? "")

  function findKey(key: string) {
    return pluginKeys.find((p) => p.pluginId === PluginID.GOOGLE_SEARCH)?.requiredKeys.find((k) => k.key === key)
  }

  const onClose = () => {
    handlePluginKeyChange({
      pluginId: PluginID.GOOGLE_SEARCH,
      requiredKeys: [
        {
          key: "GOOGLE_API_KEY",
          value: googleApiKey
        },
        {
          key: "GOOGLE_CSE_ID",
          value: googleCseId
        }
      ]
    })

    setIsChanging(false)
  }

  return (
    <>
      <SidebarButton
        text={t("Google Search API key")}
        icon={<IconKey size={18} />}
        onClick={() => setIsChanging(true)}
      />

      {isChanging && (
        <Dialog onClose={onClose} onClickAway={onClose}>
          <FormHeader>Google Search plugin</FormHeader>
          <FormText>
            If you enter a valid Google Search API key and Google Custom Search Engine (CSE) ID, the Google Search
            plugin is enabled. This allows you to search the web from the chat bar. The search results will be
            interpreted by Chatty and presented as a chat message, with references to found pages.
          </FormText>

          <FormLabel className="mt-4">Google Search API key</FormLabel>
          <Input
            type="password"
            value={googleApiKey}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setGoogleApiKey(e.target.value)
            }}
          />

          <FormLabel className="mt-4">Google Custom Search Engine (CSE) ID</FormLabel>
          <Input
            type="password"
            value={googleCseId}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setGoogleCseId(e.target.value)
            }}
          />
          <div className="mt-4 flex flex-row gap-3">
            <Button type="button" onClick={onClose}>
              {t("Save")}
            </Button>

            <Button
              onClick={() => {
                setGoogleApiKey("")
                setGoogleCseId("")
                handleClearPluginKey(PluginID.GOOGLE_SEARCH)
              }}
            >
              Clear API key and CSE ID
            </Button>
          </div>
        </Dialog>
      )}
    </>
  )
}

export default PluginKeyList
