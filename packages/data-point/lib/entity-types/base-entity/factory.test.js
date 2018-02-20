/* eslint-env jest */

const Factory = require('./factory')

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
