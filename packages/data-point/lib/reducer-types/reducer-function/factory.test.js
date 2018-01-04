/* eslint-env jest */
'use strict'

const rf = require('./factory')

test('reducer/reducer-function#isFunction', () => {
  expect(rf.isFunction('$foo')).toBe(false)
  expect(rf.isFunction('foo()')).toBe(false)
  expect(rf.isFunction(() => true)).toBe(true)
})

describe('reducer/reducer-function#validateFunction', () => {
  expect(rf.validateFunction(() => true)).toBe(true)
  expect(rf.validateFunction(a => true)).toBe(true)
  expect(rf.validateFunction((a, b) => true)).toBe(true)
  expect(() =>
    rf.validateFunction((a, b, c) => true)
  ).toThrowErrorMatchingSnapshot()
})

describe('reducer/reducer-function#create', () => {
  test('function body', () => {
    const reducerFunction = () => (acc, done) => done(null, acc.value * 2)
    const reducer = rf.create(reducerFunction)
    expect(reducer.body).toEqual(reducerFunction)
  })
})
