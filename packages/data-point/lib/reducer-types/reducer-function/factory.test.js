/* eslint-env jest */
'use strict'

const factory = require('./factory')
const createReducer = require('../index').create

test('reducer/reducer-function#isType', () => {
  expect(factory.isType('$foo')).toBe(false)
  expect(factory.isType('foo()')).toBe(false)
  expect(factory.isType(() => true)).toBe(true)
})

describe('reducer/reducer-function#validateFunction', () => {
  expect(factory.validateFunction(() => true)).toBe(true)
  expect(factory.validateFunction(a => true)).toBe(true)
  expect(factory.validateFunction((a, b) => true)).toBe(true)
  expect(() =>
    factory.validateFunction((a, b, c) => true)
  ).toThrowErrorMatchingSnapshot()
})

describe('reducer/reducer-function#create', () => {
  test('function body', () => {
    const reducerFunction = () => (acc, done) => done(null, acc.value * 2)
    const reducer = factory.create(createReducer, reducerFunction)
    expect(reducer.body).toEqual(reducerFunction)
  })
})
