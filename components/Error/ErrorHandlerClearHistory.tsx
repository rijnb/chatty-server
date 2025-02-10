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

import React, {Component, ErrorInfo, ReactNode} from "react"

import {removeConversationsHistory, removeSelectedConversation} from "@/utils/app/conversations"
import {exportData} from "@/utils/app/export"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorHandlerClearHistory extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {hasError: false, error: null}
  }

  static cleanup = () => {
    // Remove the current chat history, just in case it contains problematic data. It's better to lose the chat
    // history than to have the app crash and not be able to recover.
    exportData("conversations", "chat")
    removeConversationsHistory()
    removeSelectedConversation()
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    console.log("getDerivedStateFromError: Error")
    return {hasError: true, error}
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.log("componentDidCatch: Uncaught exception")
    console.log({error, errorInfo})
    ErrorHandlerClearHistory.cleanup()
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
          <div>-</div>
          <div>
            We had to clear your conversation history here, but automatically saved the history to your{" "}
            <strong>Downloads</strong> folder. You should be able to recover them from there.
          </div>
          <div>-</div>
          <div>Refresh this page, or wait until Chatty reloads automatically in a couple of seconds.</div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorHandlerClearHistory
