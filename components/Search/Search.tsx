import {IconX} from "@tabler/icons-react"
import {useTranslation} from "next-i18next"
import React from "react"

interface Props {
  placeholder: string
  searchTerm: string
  onSearch: (searchTerm: string) => void
}

const Search = ({placeholder, searchTerm, onSearch}: Props) => {
  const {t} = useTranslation("common")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value)
  }

  const handleClear = () => {
    onSearch("")
  }

  return (
    <div className="relative flex items-center">
      <input
        className="w-full flex-1 rounded-md border border-gray-300 bg-gray-100 px-4 py-3 pr-10 text-[14px] leading-3 text-black dark:border-gray-600/20 dark:bg-[#202123] dark:text-white"
        type="text"
        placeholder={t(placeholder)}
        value={searchTerm}
        onChange={handleChange}
      />

      {searchTerm && (
        <IconX
          className="absolute right-4 cursor-pointer text-neutral-400 hover:text-neutral-600 dark:text-neutral-300 dark:hover:text-neutral-400"
          size={18}
          onClick={handleClear}
        />
      )}
    </div>
  )
}

export default Search
