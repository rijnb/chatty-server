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
