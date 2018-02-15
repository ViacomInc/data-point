/* eslint-env jest */

const helpers = require('./type-check-helpers')
const typeCheckFunctions = require('./type-check-functions')

describe('type-check-helpers#normalizeTypeCheckSource', () => {
  test('It should return function reducer it matches any of the predefined types', () => {
    expect(helpers.normalizeTypeCheckSource('string')).toEqual(
      typeCheckFunctions.isString
    )
    expect(helpers.normalizeTypeCheckSource('number')).toEqual(
      typeCheckFunctions.isNumber
    )
  })

  test('It should return the reducer -as-is- if no match', () => {
    expect(helpers.normalizeTypeCheckSource('foo:bar')).toEqual('foo:bar')
  })

  test('It should process arrays that include some predefined types', () => {
    expect(
      helpers.normalizeTypeCheckSource(['string', 'foo:bar', 'number'])
    ).toEqual([
      typeCheckFunctions.isString,
      'foo:bar',
      typeCheckFunctions.isNumber
    ])
  })
})

describe('type-check-helpers#getTypeCheckSourceWithDefault', () => {
  test('should return defaultType when no specType is provided', () => {
    expect(helpers.getTypeCheckSourceWithDefault('hash', 'string')).toBe(
      'string'
    )
  })
  test('should return defaultType when specType === defaultType', () => {
    expect(
      helpers.getTypeCheckSourceWithDefault('hash', 'string', 'string')
    ).toBe('string')
  })
  test('should throw error for invalid specType', () => {
    expect(() =>
      helpers.getTypeCheckSourceWithDefault('hash', 'string', 'number')
    ).toThrowErrorMatchingSnapshot()
  })
  test('should return array when specType is valid and !== defaultType', () => {
    const customTypeCheck = () => true
    expect(
      helpers.getTypeCheckSourceWithDefault('hash', 'string', customTypeCheck)
    ).toEqual(['string', customTypeCheck])
  })
})
