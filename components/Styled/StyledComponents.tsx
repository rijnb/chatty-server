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

import React, {ElementType, ForwardedRef, HTMLAttributes, ReactElement} from "react"

function createStyledComponent<P extends HTMLAttributes<HTMLElement>>(
  Component: ElementType,
  baseStyles: string,
  extraProps?: P
) {
  // TODO [techdebt]: The 'any' type was 'P' but is no usuable. This is a workaround.
  const component = React.forwardRef(
    ({className, children, ...props}: any, ref: ForwardedRef<HTMLElement>): ReactElement => {
      const classes = [className, baseStyles].filter(Boolean).join(" ")

      const allProps = {
        ...extraProps,
        ...props
      }

      return (
        <Component ref={ref} className={classes} {...allProps}>
          {children}
        </Component>
      )
    }
  )
  component.displayName = `Styled${Component}`
  return component
}

export const FormLabel = createStyledComponent<React.LabelHTMLAttributes<HTMLLabelElement>>(
  "label",
  "inline-block text-lg font-medium text-gray-800 dark:text-gray-300"
)

export const FormHeader = createStyledComponent<React.HTMLAttributes<HTMLSpanElement>>(
  "span",
  "block text-xl font-bold text-gray-800 dark:text-gray-300"
)

export const FormText = createStyledComponent<React.HTMLAttributes<HTMLSpanElement>>(
  "span",
  "block text-sm font-medium text-gray-500 dark:text-gray-400"
)
export const FormDisclaimer = createStyledComponent<React.HTMLAttributes<HTMLSpanElement>>("span", "block text-sm")

export const Button = createStyledComponent<React.ButtonHTMLAttributes<HTMLButtonElement>>(
  "button",
  "w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 shadow hover:bg-gray-200 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600",
  {type: "button"}
)

export const Input = createStyledComponent<React.InputHTMLAttributes<HTMLInputElement>>(
  "input",
  "w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 shadow focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
)
export const Range = createStyledComponent<React.InputHTMLAttributes<HTMLInputElement>>(
  "input",
  "w-full appearance-none rounded-lg border border-gray-300 shadow focus:outline-none dark:border-gray-600 dark:bg-gray-700",
  {type: "range"}
)
export const TextArea = createStyledComponent<React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  "textarea",
  "w-full resize-none rounded-lg border border-gray-300 px-4 py-2 text-gray-800 shadow focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
)
export const Select = createStyledComponent<React.SelectHTMLAttributes<HTMLSelectElement>>(
  "select",
  "w-full rounded-lg border border-gray-300 px-2 py-2 text-gray-800 shadow hover:bg-gray-200 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
)
