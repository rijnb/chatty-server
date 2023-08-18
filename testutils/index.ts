export function asMock<T extends (...args: any[]) => any>(value: T) {
  return value as jest.MockedFunction<T>
}
