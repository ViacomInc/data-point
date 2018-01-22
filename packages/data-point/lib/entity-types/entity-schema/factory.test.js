/* eslint-env jest */

const Factory = require('./factory')

test('Factory#create', () => {
  const obj = Factory.create({
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

  expect(() =>
    Factory.create({
      schema: { type: null }
    })
  ).toThrowErrorMatchingSnapshot()
})

test('Factory#validateSchema', () => {
  expect(Factory.validateSchema({}, {})).toBe(true)
  expect(() => Factory.validateSchema(42, {})).toThrowErrorMatchingSnapshot()
  expect(() =>
    Factory.validateSchema({ type: null }, {})
  ).toThrowErrorMatchingSnapshot()
})
