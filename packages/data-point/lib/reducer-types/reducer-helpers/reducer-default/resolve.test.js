/* eslint-env jest */

const { resolve } = require('./resolve')

describe('ReducerDefault#resolve', () => {
  test('resolve with input value', () => {
    expect(resolve({ value: 0 }, 5)).toEqual({ value: 0 })
    expect(resolve({ value: false }, 5)).toEqual({ value: false })
    expect(resolve({ value: 'value' }, 5)).toEqual({ value: 'value' })
    expect(resolve({ value: { a: 1 } }, 5)).toEqual({ value: { a: 1 } })
  })
  test('resolve with default value', () => {
    expect(resolve({ value: '' }, 5)).toEqual({ value: 5 })
    expect(resolve({ value: undefined }, 5)).toEqual({ value: 5 })
    expect(resolve({ value: null }, 5)).toEqual({ value: 5 })
    expect(resolve({ value: NaN }, 5)).toEqual({ value: 5 })
    expect(resolve({ value: undefined }, undefined)).toEqual({
      value: undefined
    })
  })
  test('resolve with default value function', () => {
    expect(resolve({ value: undefined }, () => 5)).toEqual({ value: 5 })
  })
})
