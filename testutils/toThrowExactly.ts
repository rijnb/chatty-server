import type {MatcherFunction} from "expect"

const extractErrorProperties = (error: Error) => {
  return Object.getOwnPropertyNames(error)
    .filter((key) => key !== "stack")
    .reduce((acc, key) => ({...acc, [key]: (error as any)[key]}), {})
}

export const toThrowExactly: MatcherFunction<[expected: Error]> = function (received, expected) {
  let actual = received
  if (typeof received === "function") {
    try {
      received()
    } catch (e) {
      actual = e as Error
    }
  }

  const actualProperties = Object.getOwnPropertyNames(actual)
    .filter((key) => key !== "stack")
    .reduce((acc, key) => ({...acc, [key]: (actual as any)[key]}), {})
  const expectedProperties = extractErrorProperties(expected)

  const pass = actual instanceof expected.constructor && this.equals(actualProperties, expectedProperties)

  return pass
    ? {
        pass: true,
        message: () =>
          `Expected function not to throw an "${this.utils.printExpected(
            expected
          )}", but got "${this.utils.printReceived(actual)}"`
      }
    : {
        pass: false,
        message: () =>
          `Expected function to throw "${this.utils.printExpected(expected)}", but got "${this.utils.printReceived(
            actual
          )}. ${this.utils.diff(actualProperties, expectedProperties)}"`
      }
}
