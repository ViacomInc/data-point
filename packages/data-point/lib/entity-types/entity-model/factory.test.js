/* eslint-env jest */

const Factory = require('./factory')

test.skip('Factory#create', () => {
  const obj = Factory.create({
    value: ['$foo', (acc, done) => {}]
  })

  expect(obj).toHaveProperty('value')
})
