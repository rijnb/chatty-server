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
