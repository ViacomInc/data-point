/* eslint-env jest */

const modelFactory = require('./factory')
const createReducer = require('../../reducer-types').create

test('modelFactory#create default', () => {
  const result = modelFactory.create(createReducer, '$a', 'test')

  expect(result).toHaveProperty('id', 'test')
  expect(result.value).toHaveProperty('type', 'ReducerPath')
})
