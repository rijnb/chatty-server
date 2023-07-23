import {KeyboardEvent} from "react"

export function isEnterKey(e: KeyboardEvent): boolean {
  // Check for both the 'Enter' key and its keyCode (13) (to support other keyboards such as iPad).
  const isEnter =
    e.key === "Enter" || e.code === "Enter" || e.code === "NumpadEnter"
  return isEnter
}