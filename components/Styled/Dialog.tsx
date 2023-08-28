import React from "react"

import {ModalDialog} from "@/components/ModalDialog"
import {Props} from "@/components/ModalDialog/ModalDialog"

export const Dialog = ({children, ...props}: Props) => {
  return (
    <ModalDialog
      className="max-w-lg rounded-lg border border-gray-300 bg-gray-50 p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800"
      {...props}
    >
      {children}
    </ModalDialog>
  )
}
