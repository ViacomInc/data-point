/* eslint-env jest */

const Factory = require('./factory')

test('middleware-context.create', () => {
  const result = Factory.create({})
  expect(result).toEqual({
    ___done: false,
    ___resolve: 0
  })
})
