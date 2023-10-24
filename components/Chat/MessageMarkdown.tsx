import React from "react"
import rehypeMathjax from "rehype-mathjax"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"

import CodeBlock from "@/components/Markdown/CodeBlock"
import MemoizedReactMarkdown from "@/components/Markdown/MemoizedReactMarkdown"
import {Message} from "@/types/chat"

interface Props {
  message: Message
  isComplete: boolean
}

const MessageMarkdown = ({message, isComplete}: Props) => {
  return (
    <MemoizedReactMarkdown
      className="prose flex-1 dark:prose-invert"
      remarkPlugins={[
        [remarkGfm, {}],
        [
          remarkMath,
          {
            inlineMathDouble: true /* enable \(...\) */,
            displayMathDouble: true /* enable \[...\] */
          }
        ]
      ]}
      rehypePlugins={[
        [
          rehypeMathjax,
          {
            /* configuration options go here if needed */
          }
        ]
      ]}
      components={{
        code({node, inline, className, children, ...props}) {
          if (children.length) {
            if (children[0] == "▍") {
              return <span className="mt-1 animate-pulse cursor-default">▍</span>
            }
            children[0] = (children[0] as string).replace("▍", "▍")
          }

          const match = /language-(\w+)/.exec(className ?? "")
          return !inline ? (
            <CodeBlock
              key={Math.random()}
              language={(match && match[1]) || ""}
              value={String(children).replace(/\n\n$/, "\n")}
              {...props}
            />
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          )
        },
        table({children}) {
          return <table className="border-collapse border border-black px-3 py-1 dark:border-white">{children}</table>
        },
        th({children}) {
          return (
            <th className="break-words border border-black bg-gray-500 px-3 py-1 text-white dark:border-white">
              {children}
            </th>
          )
        },
        td({children}) {
          return <td className="break-words border border-black px-3 py-1 dark:border-white">{children}</td>
        }
      }}
    >
      {`${message.content}${!isComplete ? "`▍`" : ""}`}
    </MemoizedReactMarkdown>
  )
}

export default MessageMarkdown
