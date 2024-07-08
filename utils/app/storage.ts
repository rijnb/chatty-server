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

export function localStorageSafeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value)
  } catch (e) {
    alert(
      "Error saving to local storage. Make sure you have enough local storage by removing large conversations or prompts."
    )
    console.error("Error saving to localStorage", e)
    return false
  }
  return true
}

export function localStorageSafeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch (e) {
    alert("Error reading from local storage.")
    console.error("Error reading from localStorage", e)
    return null
  }
}

export function localStorageSafeRemoveItem(key: string): boolean {
  try {
    localStorage.removeItem(key)
  } catch (e) {
    alert("Error removing item from local storage. Please try again.")
    console.error("Error removing item from localStorage", e)
    return false
  }
  return true
}
