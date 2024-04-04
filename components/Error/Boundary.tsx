import React, {Component, ErrorInfo, ReactNode} from "react"

import {
  removeConversationsHistory,
  removeSelectedConversation,
  saveConversationsHistory
} from "@/utils/app/conversations"

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
      // You can render any custom fallback UI
      return (
        <h1>
          Important: We encountered a serious technical problem. We needed to remove the current chat history for that.
          Please refresh this page (perhaps several times)...
        </h1>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
