/* eslint-env jest */
'use strict'

const factory = require('./factory')

test('factory#create', () => {
  const obj = factory.create({
    schema: {
      properties: {
        foo: { type: 'number' },
        bar: { type: 'string' }
      }
    },
    options: {
      v5: false
    }
  })

  expect(obj).toHaveProperty('schema')
  expect(obj).toHaveProperty('options')
  expect(obj).not.toHaveProperty('before')
  expect(obj).not.toHaveProperty('after')
  expect(obj).not.toHaveProperty('error')
  expect(obj).toHaveProperty('params')
})
