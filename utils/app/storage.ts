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
