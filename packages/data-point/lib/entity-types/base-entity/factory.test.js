/* eslint-env jest */

const Factory = require('./factory')

const typeCheckFunctionReducers = require('../../helpers/type-check-function-reducers')

describe('Factory.normalizeTypeCheckSource', () => {
  test('It should return function reducer it matches any of the predefined types', () => {
    expect(Factory.normalizeTypeCheckSource('string')).toEqual(
      typeCheckFunctionReducers.isString
    )
    expect(Factory.normalizeTypeCheckSource('number')).toEqual(
      typeCheckFunctionReducers.isNumber
    )
  })

  test('It should return the reducer -as-is- if no match', () => {
    expect(Factory.normalizeTypeCheckSource('foo:bar')).toEqual('foo:bar')
  })

  test('It should process arrays that include some predefined types', () => {
    expect(
      Factory.normalizeTypeCheckSource(['string', 'foo:bar', 'number'])
    ).toEqual([
      typeCheckFunctionReducers.isString,
      'foo:bar',
      typeCheckFunctionReducers.isNumber
    ])
  })
})

describe('Factory.create', () => {
  test('It should create entity defaults', () => {
    function FooEntity () {}
    const entity = Factory.create(
      FooEntity,
      {
        before: '$',
        value: '$',
        error: '$',
        after: '$'
      },
      'foo'
    )

    expect(entity).toHaveProperty('id', 'foo')
    expect(entity).toHaveProperty('value.type', 'ReducerPath')
    expect(entity).toHaveProperty('error.type', 'ReducerPath')
    expect(entity).toHaveProperty('after.type', 'ReducerPath')
    expect(entity).toHaveProperty('params', {})
  })
})
