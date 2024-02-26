import {Dispatch, createContext, useContext} from "react"

import {HomeInitialState} from "./home.state"
import {ActionType} from "@/hooks/useCreateReducer"

export interface HomeContextProps {
  state: HomeInitialState
  dispatch: Dispatch<ActionType<HomeInitialState>>
}

const HomeContext = createContext<HomeContextProps>(undefined!)

export const useHomeContext = () => {
  return useContext(HomeContext)
}

export default HomeContext
