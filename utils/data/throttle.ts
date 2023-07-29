/**
 * Throttles a given function, ensuring it's executed at most once per specified time limit.
 *
 * @param func - The function to throttle. Its type is generic, accepting any function with any number of arguments.
 * @param limitMs - The number of milliseconds that should pass before the function is allowed to execute again.
 * @returns A throttled version of the input function, respecting the given time limit between consecutive executions.
 *
 * @template T - A generic type extending a function that takes any number of arguments and returns any type.
 */
export function throttle<T extends (...args: any[]) => any>(func: T, limitMs: number): T {
  let lastFunc: ReturnType<typeof setTimeout>
  let lastRan: number

  return ((...args) => {
    if (!lastRan) {
      func(...args)
      lastRan = Date.now()
    } else {
      clearTimeout(lastFunc)
      lastFunc = setTimeout(
        () => {
          if (Date.now() - lastRan >= limitMs) {
            func(...args)
            lastRan = Date.now()
          }
        },
        limitMs - (Date.now() - lastRan)
      )
    }
  }) as T
}
