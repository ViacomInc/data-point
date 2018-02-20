/* eslint-env jest */

const utils = require('./index')

describe('utils#isFalsy', () => {
  test('returns true when input is null', () => {
    expect(utils.isFalsy(null)).toBe(true)
  })

  test('returns true when input is undefined', () => {
    expect(utils.isFalsy(undefined)).toBe(true)
  })

  test('returns true when input is NaN', () => {
    expect(utils.isFalsy(NaN)).toBe(true)
  })

  test("returns true when input is ''", () => {
    expect(utils.isFalsy('')).toBe(true)
  })

  test("returns false when input is 'undefined'", () => {
    expect(utils.isFalsy('undefined')).toBe(false)
  })

  test('returns false when input is {}', () => {
    expect(utils.isFalsy({})).toBe(false)
  })

  test('returns false when input is []', () => {
    expect(utils.isFalsy([])).toBe(false)
  })

  test('returns false when input is 0', () => {
    expect(utils.isFalsy(0)).toBe(false)
  })

  test('returns false when input is false', () => {
    expect(utils.isFalsy(false)).toBe(false)
  })

  test('returns false when input is true', () => {
    expect(utils.isFalsy(true)).toBe(false)
  })
})

describe('utils#reducerPredicateIsTruthy with ReducerList', () => {
  test('returns false when output is undefined', () => {
    expect(
      utils.reducerPredicateIsTruthy({ type: 'ReducerList' }, undefined)
    ).toBe(false)
  })

  test('returns false when output is false', () => {
    expect(utils.reducerPredicateIsTruthy({ type: 'ReducerList' }, false)).toBe(
      false
    )
  })

  test("returns false when output is ''", () => {
    expect(utils.reducerPredicateIsTruthy({ type: 'ReducerList' }, '')).toBe(
      false
    )
  })

  test('returns false when output is 0', () => {
    expect(utils.reducerPredicateIsTruthy({ type: 'ReducerList' }, 0)).toBe(
      false
    )
  })

  test('returns true when output is true', () => {
    expect(utils.reducerPredicateIsTruthy({ type: 'ReducerList' }, true)).toBe(
      true
    )
  })

  test("returns true when output is 'undefined'", () => {
    expect(
      utils.reducerPredicateIsTruthy({ type: 'ReducerList' }, 'undefined')
    ).toBe(true)
  })
})

describe('utils#reducerPredicateIsTruthy with ReducerObject', () => {
  test('returns false when output is {}', () => {
    expect(utils.reducerPredicateIsTruthy({ type: 'ReducerObject' }, {})).toBe(
      false
    )
  })

  test('returns false when output has an empty string as a value', () => {
    expect(
      utils.reducerPredicateIsTruthy(
        { type: 'ReducerObject' },
        {
          a: true,
          b: ''
        }
      )
    ).toBe(false)
  })

  test('returns false when output has undefined as a value', () => {
    expect(
      utils.reducerPredicateIsTruthy(
        { type: 'ReducerObject' },
        {
          a: true,
          b: undefined
        }
      )
    ).toBe(false)
  })

  test('returns true when output values are true', () => {
    expect(
      utils.reducerPredicateIsTruthy(
        { type: 'ReducerObject' },
        {
          a: true,
          b: true
        }
      )
    ).toBe(true)
  })

  test('returns true when output values are either true or false', () => {
    expect(
      utils.reducerPredicateIsTruthy(
        { type: 'ReducerObject' },
        {
          a: false,
          b: true
        }
      )
    ).toBe(true)
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
