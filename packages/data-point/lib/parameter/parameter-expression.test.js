/* eslint-env jest */
'use strict'

const expression = require('./parameter-expression')

test('parameter#create', () => {
  const result = expression.create('foo', 'bar')
  expect(result.type).toBe('foo')
  expect(result.value).toBe('bar')
})

test('parameter#parseParameter undefined', () => {
  const result = expression.parse('undefined')
  expect(result.value).toBeUndefined()
  expect(result.type).toBe('undefined')
})

test('parameter#parseParameter null', () => {
  const result = expression.parse('null')
  expect(result.value).toBe(null)
  expect(result.type).toBe('null')
})

describe('parameter#parseParameter boolean', () => {
  test('parse string as true', () => {
    const resultTrue = expression.parse('true')
    expect(resultTrue.value).toBe(true)
    expect(resultTrue.type).toBe('boolean')
  })

  test('parse string as false', () => {
    const resultFalse = expression.parse('false')
    expect(resultFalse.value).toBe(false)
    expect(resultFalse.type).toBe('boolean')
  })
})

test('parameter#parseParameter number', () => {
  const result = expression.parse('-12.02')
  expect(result.value).toBe(-12.02)
  expect(result.type).toBe('number')
  expect(expression.parse('12.02').value).toBe(12.02)
  expect(expression.parse('12').value).toBe(12)
  expect(expression.parse('0').value).toBe(0)
})

test('parameter#parseParameter string', () => {
  const result = expression.parse('"str"ing"')
  expect(result.value).toBe('str"ing')
  expect(result.type).toBe('string')
})

test('parameter#parseParameter reducer', () => {
  const result = expression.parse('some.foo')
  expect(result.value).toBe('some.foo')
  expect(result.type).toBe('reducer')
  expect(expression.parse('_.some.foo').type).toBe('reducer')
})

test('parameter#parseParameter error', () => {
  const result = expression.parse("'some.foo")
  expect(result.value).toBeInstanceOf(Error)
  expect(result.type).toBe('error')
  expect(expression.parse('.some.foo').type).toBe('error')
  expect(expression.parse("some.foo'").type).toBe('error')
})
