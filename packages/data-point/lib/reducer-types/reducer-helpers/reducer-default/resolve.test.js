/* eslint-env jest */

const { resolve } = require('./resolve')

describe('ReducerDefault#resolve', () => {
  test('resolve with input value', () => {
    expect(resolve(0, 5)).toBe(0)
    expect(resolve(false, 5)).toBe(false)
    expect(resolve('value', 5)).toBe('value')
    expect(resolve({ a: 1 }, 5)).toEqual({ a: 1 })
  })
  test('resolve with default value', () => {
    expect(resolve('', 5)).toBe(5)
    expect(resolve(undefined, 5)).toBe(5)
    expect(resolve(null, 5)).toBe(5)
    expect(resolve(NaN, 5)).toBe(5)
    expect(resolve(undefined, undefined)).toBeUndefined()
  })
  test('resolve with default value function', () => {
    expect(resolve(undefined, () => 5)).toBe(5)
  })
})
