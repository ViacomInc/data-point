/* eslint-env jest */

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
    expect(entity).toHaveProperty('value.type', 'ReducerPath')
    expect(entity).toHaveProperty('error.type', 'ReducerPath')
    expect(entity).toHaveProperty('after.type', 'ReducerPath')
    expect(entity).toHaveProperty('params', {})
  })
})
