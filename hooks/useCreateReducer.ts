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