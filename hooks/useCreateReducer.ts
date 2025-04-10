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
import {useMemo, useReducer} from "react"

/**
 * Extracts property names from initial state of reducer to allow typesafe dispatch objects.
 */
export type FieldNames<T> = {
  [K in keyof T]: T[K] extends string ? K : K
}[keyof T]

/**
 * Returns the Action Type for the dispatch object to be used for typing in things like context.
 */
export type ActionType<T> = {type: "reset"} | {type?: "change"; field: FieldNames<T>; value: any}

/**
 * Returns a typed dispatch and state.
 */
export const useCreateReducer = <T>({initialState}: {initialState: T}) => {
  type Action = {type: "reset"} | {type?: "change"; field: FieldNames<T>; value: any}

  const reducer = (state: T, action: Action) => {
    switch (action.type) {
      case "reset":
        return initialState
      case "change":
      case undefined:
        return {...state, [action.field]: action.value}
      default:
        throw new Error("Unknown action type in dispatch")
    }
  }
  const [state, dispatch] = useReducer(reducer, initialState)
  return useMemo(() => ({state, dispatch}), [state, dispatch])
}
