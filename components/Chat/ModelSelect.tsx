import {useContext} from "react"

import {useTranslation} from "next-i18next"

import HomeContext from "@/pages/api/home/home.context"


export const ModelSelect = () => {
  const {t} = useTranslation("chat")

  const {
    state: {selectedConversation, models, defaultModelId},
    handleUpdateConversation,
    dispatch: homeDispatch
  } = useContext(HomeContext)

  const handleSelectModel = (e: React.ChangeEvent<HTMLSelectElement>) => {
    selectedConversation &&
      handleUpdateConversation(selectedConversation, {
        key: "model",
        value: models.find((model) => model.id === e.target.value)
      })
  }

  return (
    <div className="flex flex-col">
      <label className="mb-2 text-left text-neutral-700 dark:text-neutral-400">{t("Model")}</label>
      <div className="w-full rounded-lg border border-neutral-200 bg-transparent pr-2 text-neutral-900 dark:border-neutral-600 dark:text-white">
        <select
          className="w-full bg-transparent p-2"
          placeholder={t("Select a model") || ""}
          value={selectedConversation?.model?.id || defaultModelId}
          onChange={handleSelectModel}
        >
          {models.map((model) => (
            <option key={model.id} value={model.id} className="dark:bg-[#343541] dark:text-white">
              {model.id === defaultModelId ? `Default (${model.name})` : model.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}