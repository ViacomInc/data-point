/* eslint-env jest */
'use strict'

const factory = require('./factory')
const createReducer = require('../index').create

test('reducer/reducer-entity#isType', () => {
  expect(factory.isType('a')).toBe(false)
  expect(factory.isType('ab')).toBe(false)
  expect(factory.isType('#ab')).toBe(false)
  expect(factory.isType('abc')).toBe(false)
  expect(factory.isType('ab:')).toBe(false)
  expect(factory.isType(':ab')).toBe(false)
  expect(factory.isType('$a:abc')).toBe(false)
  expect(factory.isType('a-bc:abc')).toBe(false)
  expect(factory.isType('a:abc')).toBe(true)
  expect(factory.isType('abc:a')).toBe(true)
  expect(factory.isType('abc:abc')).toBe(true)
  expect(factory.isType('?abc:abc')).toBe(true)
  expect(factory.isType('abc:ab-c-')).toBe(true)
  expect(factory.isType('_abc:abc')).toBe(true)
  expect(factory.isType('#abc:abc')).toBe(true)
  expect(factory.isType('abc:abc[]')).toBe(true)
  expect(factory.isType('abc:abc[][]')).toBe(false)
  expect(factory.isType('abc:abc[]d')).toBe(false)
})

describe('create', function () {
  test('default create', () => {
    const reducer = factory.create(createReducer, 'foo:abc')
    expect(reducer.hasEmptyConditional).toBe(false)
    expect(reducer.asCollection).toBe(false)
    expect(reducer.type).toBe('ReducerEntity')
    expect(reducer.name).toBe('abc')
    expect(reducer.entityType).toBe('foo')
  })

  test('as collection', () => {
    const reducer = factory.create(createReducer, 'foo:abc[]')
    expect(reducer.asCollection).toBe(true)
    expect(reducer.hasEmptyConditional).toBe(false)
    expect(reducer.type).toBe('ReducerEntity')
    expect(reducer.name).toBe('abc')
    expect(reducer.entityType).toBe('foo')
  })

  test('with conditional', () => {
    const reducer = factory.create(createReducer, '?foo:abc')
    expect(reducer.hasEmptyConditional).toBe(true)
    expect(reducer.asCollection).toBe(false)
    expect(reducer.type).toBe('ReducerEntity')
    expect(reducer.name).toBe('abc')
    expect(reducer.entityType).toBe('foo')
  })

  test('with conditional and as collection', () => {
    const reducer = factory.create(createReducer, '?foo:abc[]')
    expect(reducer.hasEmptyConditional).toBe(true)
    expect(reducer.asCollection).toBe(true)
    expect(reducer.type).toBe('ReducerEntity')
    expect(reducer.name).toBe('abc')
    expect(reducer.entityType).toBe('foo')
  })
})
