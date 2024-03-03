import {StreamingError} from "@/utils/server/errors"

export class LimitExceeded extends Error {
  limit?: number
  requested?: number

  constructor(message: string, limit?: number, requested?: number) {
    super(message)
    this.name = this.constructor.name
    this.limit = limit
    this.requested = requested
  }
}

export type StreamEvents = {
  connect: () => void
  content: (content: {delta: string; snapshot: string}) => void
  toolCall: (name: string, toolArguments: string) => void
  error: (error: StreamingError) => void
  abort: () => void
  end: () => void
}

export type EventType = keyof StreamEvents
export type ListenerForEvent<E extends EventType> = StreamEvents[E]
export type EventParameters<E extends EventType> = Parameters<ListenerForEvent<E>>
