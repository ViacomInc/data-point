/* eslint-env jest */

const Factory = require('./factory')
const createReducer = require('../../reducer-types').create

test('Factory#create', () => {
  const obj = Factory.create(createReducer, {
    value: ['$foo', (acc, done) => {}]
  })

  expect(obj).toHaveProperty('value')
})
