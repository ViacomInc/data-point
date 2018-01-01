/* eslint-env jest */
'use strict'

const createBaseEntity = require('./factory').create

describe('factory.createBaseEntity', () => {
  test('It should create entity defaults', () => {
    function FooEntity () {}
    const entity = createBaseEntity(
      FooEntity,
      {
        before: '$.',
        value: '$.',
        error: '$.',
        after: '$.'
      },
      'foo'
    )

    expect(entity).toHaveProperty('id', 'foo')
    expect(entity).toHaveProperty('value.typeOf', 'TransformExpression')
    expect(entity).toHaveProperty('error.typeOf', 'TransformExpression')
    expect(entity).toHaveProperty('after.typeOf', 'TransformExpression')
    expect(entity).toHaveProperty('params', {})
  })
})
