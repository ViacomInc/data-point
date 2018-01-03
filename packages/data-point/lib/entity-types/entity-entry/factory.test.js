/* eslint-env jest */
'use strict'

const factory = require('./factory')

test('factory#create', () => {
  const obj = factory.create({
    value: ['$foo', (acc, done) => {}]
  })

  expect(obj).toHaveProperty('before')
  expect(obj).toHaveProperty('after')
  expect(obj).toHaveProperty('error')
  expect(obj).toHaveProperty('params')
  expect(obj).toHaveProperty('value')
})
