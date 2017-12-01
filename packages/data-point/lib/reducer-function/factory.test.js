/* eslint-env jest */
'use strict'

const rf = require('./factory')

test('reducer/reducer-function#isFunction', () => {
  expect(rf.isFunction('a[]')).toBe(false)
  expect(rf.isFunction('a.b.c')).toBe(false)
  expect(rf.isFunction('a.b.c(')).toBe(false)
  expect(rf.isFunction('a.b.c()')).toBe(true)
  expect(rf.isFunction(() => true)).toBe(true)
})

test('reducer/reducer-function#getFunctionName', () => {
  expect(rf.getFunctionName('abc()')).toBe('abc')
  expect(rf.getFunctionName('abc(a)')).toBe('abc')
  expect(rf.getFunctionName('a.b.c(a)')).toBe('a.b.c')
})

test('reducer/reducer-function#getParameters', () => {
  expect(rf.getParameters('a()')).toBe('')
  expect(rf.getParameters('a(a)')).toBe('a')
  expect(rf.getParameters('a(a,b,"b")')).toBe('a,b,"b"')
})

test('reducer/reducer-function#splitParameters', () => {
  expect(rf.splitParameters('a')).toEqual(['a'])
  expect(rf.splitParameters('a,b,"b"')).toEqual(['a', 'b', '"b"'])
})

test('reducer/reducer-function#parseParameters', () => {
  expect(rf.parseParameters('a()')).toHaveLength(0)
  expect(rf.parseParameters('a(,,,)')).toHaveLength(0)
  expect(rf.parseParameters('a(1)')).toHaveLength(1)
  expect(rf.parseParameters('a(1,,,)')).toHaveLength(1)
  expect(rf.parseParameters('a(1,2)')).toHaveLength(2)
})

describe('reducer/reducer-function#create', () => {
  test('basic function call', () => {
    const reducer = rf.create('a()')
    expect(reducer.type).toBe('ReducerFunction')
    expect(reducer.parameters).toHaveLength(0)
  })

  test('function call with arguments', () => {
    const reducer = rf.create('a(true,1, "s", some.foo)')
    expect(reducer.parameters).toHaveLength(4)
    expect(reducer.parameters[0].type).toBe('boolean')
    expect(reducer.parameters[0].value).toBe(true)
  })

  test('function body', () => {
    const reducerFunction = () => (acc, done) => done(null, acc.value * 2)
    const reducer = rf.create(reducerFunction)
    expect(reducer.parameters).toHaveLength(0)
    expect(reducer.isFunction).toBe(true)
    expect(reducer.body).toEqual(reducerFunction)
  })
})
