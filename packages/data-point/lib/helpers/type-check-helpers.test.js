/* eslint-env jest */

const { normalizeTypeCheckSource } = require('./type-check-helpers')
const typeCheckFunctions = require('./type-check-function-reducers')

describe('Factory.normalizeTypeCheckSource', () => {
  test('It should return function reducer it matches any of the predefined types', () => {
    expect(normalizeTypeCheckSource('string')).toEqual(
      typeCheckFunctions.isString
    )
    expect(normalizeTypeCheckSource('number')).toEqual(
      typeCheckFunctions.isNumber
    )
  })

  test('It should return the reducer -as-is- if no match', () => {
    expect(normalizeTypeCheckSource('foo:bar')).toEqual('foo:bar')
  })

  test('It should process arrays that include some predefined types', () => {
    expect(normalizeTypeCheckSource(['string', 'foo:bar', 'number'])).toEqual([
      typeCheckFunctions.isString,
      'foo:bar',
      typeCheckFunctions.isNumber
    ])
  })
})

// getOutputTypeWithDefault
