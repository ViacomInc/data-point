/* eslint-env jest */

const Factory = require('./factory')
const createReducer = require('../../reducer-types').create

test('Factory#create', () => {
  const obj = Factory.create(createReducer, {
    value: ['$foo', () => {}]
  })

  expect(obj).not.toHaveProperty('before')
  expect(obj).not.toHaveProperty('after')
  expect(obj).not.toHaveProperty('error')
  expect(obj).toHaveProperty('params')
  expect(obj).toHaveProperty('value')
})
