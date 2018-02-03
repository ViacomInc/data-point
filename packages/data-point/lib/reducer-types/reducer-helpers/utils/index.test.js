/* eslint-env jest */

const utils = require('./index')

describe('utils#reducerOutputIsFalsy', () => {
  expect(utils.reducerOutputIsFalsy(null)).toBe(true)
  expect(utils.reducerOutputIsFalsy(undefined)).toBe(true)
  expect(utils.reducerOutputIsFalsy(NaN)).toBe(true)
  expect(utils.reducerOutputIsFalsy('')).toBe(true)
  expect(utils.reducerOutputIsFalsy('undefined')).toBe(false)
  expect(utils.reducerOutputIsFalsy({})).toBe(false)
  expect(utils.reducerOutputIsFalsy([])).toBe(false)
  expect(utils.reducerOutputIsFalsy(0)).toBe(false)
  expect(utils.reducerOutputIsFalsy(false)).toBe(false)
  expect(utils.reducerOutputIsFalsy(true)).toBe(false)
})

describe('utils#reducerPredicateIsTruthy', () => {
  test('with ReducerList', () => {
    const reducer = { type: 'ReducerList' }
    expect(utils.reducerPredicateIsTruthy(reducer, undefined)).toBe(false)
    expect(utils.reducerPredicateIsTruthy(reducer, false)).toBe(false)
    expect(utils.reducerPredicateIsTruthy(reducer, '')).toBe(false)
    expect(utils.reducerPredicateIsTruthy(reducer, 0)).toBe(false)
    expect(utils.reducerPredicateIsTruthy(reducer, true)).toBe(true)
    expect(utils.reducerPredicateIsTruthy(reducer, 'undefined')).toBe(true)
  })

  test('with ReducerObject', () => {
    const reducer = { type: 'ReducerObject' }
    expect(utils.reducerPredicateIsTruthy(reducer, {})).toBe(false)
    expect(
      utils.reducerPredicateIsTruthy(reducer, {
        a: true,
        b: true
      })
    ).toBe(true)
    expect(
      utils.reducerPredicateIsTruthy(reducer, {
        a: false,
        b: true
      })
    ).toBe(true)
    expect(
      utils.reducerPredicateIsTruthy(reducer, {
        a: true,
        b: ''
      })
    ).toBe(false)
    expect(
      utils.reducerPredicateIsTruthy(reducer, {
        a: true,
        b: undefined
      })
    ).toBe(false)
  })

  test('with ReducerObject as first item in a ReducerList', () => {
    const reducer = {
      type: 'ReducerList',
      reducers: [
        {
          type: 'ReducerObject'
        },
        {
          type: 'ReducerPath'
        }
      ]
    }
    expect(utils.reducerPredicateIsTruthy(reducer, {})).toBe(true)
  })

  test('with ReducerObject as last item in a ReducerList', () => {
    const reducer = {
      type: 'ReducerList',
      reducers: [
        {
          type: 'ReducerPath'
        },
        {
          type: 'ReducerObject'
        }
      ]
    }
    expect(utils.reducerPredicateIsTruthy(reducer, {})).toBe(false)
  })
})
