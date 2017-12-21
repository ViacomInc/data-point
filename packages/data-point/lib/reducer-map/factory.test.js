/* eslint-env jest */
'use strict'

const factory = require('./factory')

test('reducer/reducer-function#isMap', () => {
  expect(factory.isMap('$foo')).toBe(false)
  expect(factory.isMap(() => true)).toBe(false)
  expect(factory.isMap([])).toBe(false)
  expect(factory.isMap({})).toBe(true)
})
