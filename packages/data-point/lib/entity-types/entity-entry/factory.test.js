/* eslint-env jest */
'use strict'

const factory = require('./factory')

test('factory#create', () => {
  const obj = factory.create({
    value: ['$foo', (acc, done) => {}]
  })

  expect(obj).not.toHaveProperty('before')
  expect(obj).not.toHaveProperty('after')
  expect(obj).not.toHaveProperty('error')
  expect(obj).toHaveProperty('params')
  expect(obj).toHaveProperty('value')
})
