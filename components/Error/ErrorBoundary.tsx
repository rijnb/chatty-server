import React, {Component, ErrorInfo, ReactNode, useContext} from "react"

import {removeConversationsHistory, removeSelectedConversation} from "@/utils/app/conversations"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {hasError: false, error: null}
  }

  static cleanup = () => {
    // Remove the current chat history, just in case it contains problematic data. It's better to lose the chat
    // history than to have the app crash and not be able to recover.
    removeConversationsHistory()
    removeSelectedConversation()
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    console.log("getDerivedStateFromError: Error")
    ErrorBoundary.cleanup()
    return {hasError: true, error}
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.log("componentDidCatch: Uncaught exception")
    console.log({error, errorInfo})
    ErrorBoundary.cleanup()
  }

  render() {
    if (this.state.hasError) {
      setTimeout(function () {
        window.location.reload()
      }, 5000)
      return (
        <div>
          <h1>ERROR:</h1>
          <div>We encountered a serious technical problem, and we could not easily recover from it.</div>
          <div>Refresh this page, or wait until Chatty reloads automatically in a couple of seconds.</div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
