import {reconstructError} from "@/utils/server/errors"
import {EventParameters, EventType, ListenerForEvent, StreamEvents} from "@/utils/shared/types"

export class StreamEventClient {
  private readonly endPromise: Promise<void>

  private listeners: {[E in EventType]?: ListenerForEvent<E>[]} = {}

  resolveEndPromise: () => void = () => {}

  private constructor() {
    this.endPromise = new Promise<void>((resolve) => {
      this.resolveEndPromise = resolve
    })

    this.endPromise.catch(() => {
      console.info("endPromise caught")
    })
  }

  static fromReadableStream(reader: ReadableStreamDefaultReader<Uint8Array>, signal: AbortSignal) {
    const client = new StreamEventClient()
    client.listen(reader, signal).catch((error) => {
      client.emit("error", error)
    })
    return client
  }

  private async listen(reader: ReadableStreamDefaultReader<Uint8Array>, signal: AbortSignal) {
    const iterator = this.createMessageIterator(reader)

    try {
      for await (const line of iterator) {
        if (signal.aborted) {
          this.emit("abort")
          return
        }
        const message = JSON.parse(line)
        if (message.event === "error") {
          this.emit(message.event, reconstructError(message.data[0]))
          return
        }
        this.emit(message.event, ...message.data)
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        this.emit("abort")
        return
      }
      throw error
    }
  }

  private async *createMessageIterator(reader: ReadableStreamDefaultReader<Uint8Array>) {
    let result
    const lineDecoder = new LineDecoder()

    while (!(result = await reader.read()).done) {
      const messages = lineDecoder.decodeLine(result.value)

      for (const line of messages) {
        yield line
      }
    }

    for (const line of lineDecoder.flush()) {
      yield line
    }
  }

  on<Event extends keyof StreamEvents>(event: Event, listener: ListenerForEvent<Event>) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }

    this.listeners[event]!.push(listener)
    return this
  }

  private emit<E extends EventType>(event: E, ...args: EventParameters<E>) {
    this.listeners[event]?.forEach((listener: any) => listener(...args))

    if (event === "end") {
      this.resolveEndPromise()
    }

    if (event === "abort" || event === "error") {
      this.emit("end")
    }
  }

  async done() {
    await this.endPromise
  }
}

export class LineDecoder {
  private decoder = new TextDecoder()

  private buffer = ""

  decodeLine(chunk: Uint8Array) {
    const str = this.buffer + this.decoder.decode(chunk)
    const lines = str.split("\n")

    if (lines.length > 1) {
      this.buffer = lines[lines.length - 1]

      return lines.slice(0, -1)
    }

    this.buffer = lines[0]
    return []
  }

  flush() {
    if (!this.buffer.length) {
      return []
    }

    const buffer = this.buffer
    this.buffer = ""
    return [buffer]
  }
}
