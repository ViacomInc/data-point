/* eslint-env jest */
'use strict'

const modelFactory = require('./factory')

test('modelFactory#create default', () => {
  const result = modelFactory.create('$a', 'test')

  expect(result).toHaveProperty('id', 'test')
  expect(result.value).toHaveProperty('type', 'ReducerPath')
})
