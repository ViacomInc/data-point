/* eslint-env jest */

const Factory = require('./factory')

const typeCheckFunctionReducers = require('../../helpers/type-check-function-reducers')

describe('Factory.getTypeModifier', () => {
  test('It should return generic type check if no modifier is implemented', () => {
    expect(Factory.getTypeModifier(undefined)).toEqual(Factory.acceptAnyType)
  })

  test('It should return function reducer it matches any of the predefined types', () => {
    expect(Factory.getTypeModifier('isString')).toEqual(
      typeCheckFunctionReducers.isString
    )
    expect(Factory.getTypeModifier('isNumber')).toEqual(
      typeCheckFunctionReducers.isNumber
    )
  })

  test('It should return the reducer -as-is- if no match', () => {
    expect(Factory.getTypeModifier('foo:bar')).toEqual('foo:bar')
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
