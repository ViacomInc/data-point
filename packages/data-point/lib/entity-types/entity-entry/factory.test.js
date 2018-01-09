/* eslint-env jest */

const Factory = require('./factory')

test('Factory#create', () => {
  const obj = Factory.create({
    value: ['$foo', (acc, done) => {}]
  })

  expect(obj).not.toHaveProperty('before')
  expect(obj).not.toHaveProperty('after')
  expect(obj).not.toHaveProperty('error')
  expect(obj).toHaveProperty('params')
  expect(obj).toHaveProperty('value')
})
