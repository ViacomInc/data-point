/* eslint-env jest */

const {
  isString,
  isNumber,
  isBoolean,
  isFunction,
  isError,
  isArray,
  isObject
} = require('./type-check-function-reducers')

// TODO rename type-check-function-reducers to not say "reducers"
function testTypeChecker (typeCheck, goodValue, badValue, type) {
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
  testTypeChecker(isString, 'foo', 1, 'string')
})

describe('isNumber', () => {
  testTypeChecker(isNumber, 1, 'foo', 'number')
})

describe('isBoolean', () => {
  testTypeChecker(isBoolean, true, 'foo', 'boolean')
  testTypeChecker(isBoolean, false, 'foo', 'boolean')
})

describe('isFunction', () => {
  const fn = () => {}
  testTypeChecker(isFunction, fn, 'foo', 'function')
})

describe('isError', () => {
  testTypeChecker(isError, new Error(), 'foo', 'Error')
})

describe('isArray', () => {
  testTypeChecker(isArray, [], 'foo', 'Array')
})

describe('isObject', () => {
  testTypeChecker(isObject, {}, [], 'Object')
})
