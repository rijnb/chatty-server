import {IconX} from "@tabler/icons-react"
import React, {FC} from "react"
import {useTranslation} from "next-i18next"


interface Props {
  placeholder: string
  searchTerm: string
  onSearch: (searchTerm: string) => void
}

const Search: FC<Props> = ({placeholder, searchTerm, onSearch}) => {
  const {t} = useTranslation("sidebar")

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value)
  }

  const clearSearch = () => {
    onSearch("")
  }

  return (
    <div className="relative flex items-center">
      <input
        className="w-full flex-1 rounded-md border border-gray-300 dark:border-gray-600/20 bg-gray-100 dark:bg-[#202123] px-4 py-3 pr-10 text-[14px] leading-3 text-black dark:text-white"
        type="text"
        placeholder={t(placeholder)}
        value={searchTerm}
        onChange={handleSearchChange}
      />

      {searchTerm && (
        <IconX
          className="absolute right-4 cursor-pointer text-neutral-400 hover:text-neutral-600 dark:text-neutral-300 dark:hover:text-neutral-400"
          size={18}
          onClick={clearSearch}
        />
      )}
    </div>
  )
}

export default Search
