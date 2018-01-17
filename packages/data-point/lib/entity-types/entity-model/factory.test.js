/* eslint-env jest */

const Factory = require('./factory')

test('Factory#create', () => {
  const obj = Factory.create({
    value: ['$foo', (acc, done) => {}]
  })

  expect(obj).toHaveProperty('value')
})
