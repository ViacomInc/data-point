/* eslint-env jest */
'use strict'

const factory = require('./factory')

test('middleware-context.create', () => {
  const result = factory.create({})
  expect(result.resolve).toBeInstanceOf(Function)
})

describe('middleware-context.resolve', () => {
  test('assign value property', () => {
    const result = factory.create({})
    result.resolve('test')
    expect(result.value).toBe('test')
  })

  test('throw error if already resolved', () => {
    const result = factory.create({})
    expect(() => {
      result.___resolve = true
      result.resolve('test')
    }).toThrow()
  })

  test('throw error if done', () => {
    const result = factory.create({})
    expect(() => {
      result.___done = true
      result.resolve('test')
    }).toThrow()
  })

  test('resolve() with no arguments, should not have side effects', () => {
    const result = factory.create({})
    result.value = 'persist'
    result.resolve()
    expect(result.___resolve).toBe(false)
    expect(result.___done).toBe(true)
  })
})
