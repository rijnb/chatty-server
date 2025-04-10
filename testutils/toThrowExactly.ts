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
