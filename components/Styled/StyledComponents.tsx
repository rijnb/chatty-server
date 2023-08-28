import React, {ElementType, ForwardedRef, HTMLAttributes, ReactElement} from "react"

function createStyledComponent<P extends HTMLAttributes<HTMLElement>>(
  Component: ElementType,
  baseStyles: string,
  extraProps?: P
) {
  const component = React.forwardRef(
    ({className, children, ...props}: P, ref: ForwardedRef<HTMLElement>): ReactElement => {
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
export const TextArea = createStyledComponent<React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  "textarea",
  "w-full resize-none rounded-lg border border-gray-300 px-4 py-2 text-gray-800 shadow focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
)
export const Select = createStyledComponent<React.SelectHTMLAttributes<HTMLSelectElement>>(
  "select",
  "w-full rounded-lg border border-gray-300 px-2 py-2 text-gray-800 shadow hover:bg-gray-200 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
)
