/* eslint-env jest */

const Promise = require('bluebird')

const {
  isString,
  isNumber,
  isBoolean,
  isFunction,
  isError,
  isArray,
  isObject
} = require('./type-check-function-reducers')

function testTypeChecker (typeCheck, goodValue, badValue, type) {
  test('It should return true if type matches', () => {
    expect(typeCheck(goodValue)).toBe(goodValue)
  })
  test(`It should throw error when not matched`, () => {
    return Promise.try(() => typeCheck(badValue))
      .catch(e => e)
      .then(result => {
        expect(result).toBeInstanceOf(Error)
        expect(result._message).toMatchSnapshot()
      })
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
