/* eslint-env jest */
'use strict'

const Factory = require('./factory')

test('Factory#create', () => {
  const obj = Factory.create({
    value: ['a() | b()', (acc, done) => {}]
  })

  expect(obj).toHaveProperty('before')
  expect(obj).toHaveProperty('after')
  expect(obj).toHaveProperty('error')
  expect(obj).toHaveProperty('params')
  expect(obj).toHaveProperty('value')
})
