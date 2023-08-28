import {IconKey} from "@tabler/icons-react"
import React, {useContext, useState} from "react"
import {useTranslation} from "react-i18next"

import ChatBarContext from "@/components/ChatBar/ChatBar.context"
import SidebarButton from "@/components/Sidebar/SidebarButton"
import {Button, Dialog, FormHeader, FormLabel, FormText, Input} from "@/components/Styled"
import {useHomeContext} from "@/pages/api/home/home.context"
import {PluginID} from "@/types/plugin"

interface Props {}

export const PluginKeyList = ({}: Props) => {
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
            onChange={(e) => {
              setGoogleApiKey(e.target.value)
            }}
          />

          <FormLabel className="mt-4">Google Custom Search Engine (CSE) ID</FormLabel>
          <Input
            type="password"
            value={googleCseId}
            onChange={(e) => {
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
