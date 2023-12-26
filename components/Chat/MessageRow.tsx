import React from "react"

interface Props {
  className: string
  icon: React.ReactNode
  children: React.ReactNode
}

const MessageRow = ({className, icon, children}: Props) => {
  return (
    <div className={className} style={{overflowWrap: "anywhere"}}>
      <div className="relative m-auto flex sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg gap-2 p-4 px-0 py-4 text-base">
        <div className="min-w-[40px] text-right font-bold">{icon}</div>
        <div className="prose mt-[-2px] w-full dark:prose-invert">{children}</div>
      </div>
    </div>
  )
}

export default MessageRow
