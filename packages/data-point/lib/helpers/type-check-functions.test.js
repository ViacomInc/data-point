/* eslint-env jest */

const {
  isString,
  isNumber,
  isBoolean,
  isFunction,
  isError,
  isArray,
  isObject
} = require('./type-check-functions').defaults

const { createTypeCheckReducer } = require('./type-check-functions')

function testTypeChecker (typeCheck, goodValue, badValue) {
  test('It should return true if type match', () => {
    expect(typeCheck(goodValue)).toBe(goodValue)
  })
  test(`It should throw error when not matched`, () => {
    expect(() => {
      typeCheck(badValue)
    }).toThrowErrorMatchingSnapshot()
  })
}

describe('isString', () => {
  testTypeChecker(isString, 'foo', 1)
})

describe('isNumber', () => {
  testTypeChecker(isNumber, 1, 'foo')
})

describe('isBoolean', () => {
  testTypeChecker(isBoolean, true, 'foo')
  testTypeChecker(isBoolean, false, 'foo')
})

describe('isFunction', () => {
  const fn = () => {}
  testTypeChecker(isFunction, fn, 'foo')
})

describe('isError', () => {
  testTypeChecker(isError, new Error(), 'foo')
})

describe('isArray', () => {
  testTypeChecker(isArray, [], 'foo')
})

describe('isObject', () => {
  testTypeChecker(isObject, {}, [])
})

describe('custom type check reducer', () => {
  const expectedType = 'non-empty array'

  const check = input => {
    return Array.isArray(input) && !!input.length
  }

  const checkWithCustomMessage = input => {
    return check(input) || 'Hello the world is collapsing.'
  }

  it("should return the input when it's valid", () => {
    const reducer = createTypeCheckReducer(check, expectedType)
    expect(reducer([true])).toEqual([true])
  })

  it('should throw error for invalid input', () => {
    const reducer = createTypeCheckReducer(check)
    expect(() => reducer(false)).toThrowErrorMatchingSnapshot()
  })

  it('should throw error (with expected type)', () => {
    const reducer = createTypeCheckReducer(check, expectedType)
    expect(() => reducer(false)).toThrowErrorMatchingSnapshot()
  })

  it('should throw error (with custom message)', () => {
    const reducer = createTypeCheckReducer(checkWithCustomMessage)
    expect(() => reducer(false)).toThrowErrorMatchingSnapshot()
  })
})
