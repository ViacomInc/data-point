/* eslint-env jest */
'use strict'

const factory = require('./factory')

test('reducer/reducer-entity#isEntity', () => {
  expect(factory.isEntity('a')).toBe(false)
  expect(factory.isEntity('ab')).toBe(false)
  expect(factory.isEntity('#ab')).toBe(false)
  expect(factory.isEntity('abc')).toBe(false)
  expect(factory.isEntity('ab:')).toBe(false)
  expect(factory.isEntity(':ab')).toBe(false)
  expect(factory.isEntity('$a:abc')).toBe(false)
  expect(factory.isEntity('a-bc:abc')).toBe(false)
  expect(factory.isEntity('a:abc')).toBe(true)
  expect(factory.isEntity('abc:a')).toBe(true)
  expect(factory.isEntity('abc:abc')).toBe(true)
  expect(factory.isEntity('?abc:abc')).toBe(true)
  expect(factory.isEntity('abc:ab-c-')).toBe(true)
  expect(factory.isEntity('_abc:abc')).toBe(true)
  expect(factory.isEntity('#abc:abc')).toBe(true)
  expect(factory.isEntity('abc:abc[]')).toBe(true)
  expect(factory.isEntity('abc:abc[][]')).toBe(false)
  expect(factory.isEntity('abc:abc[]d')).toBe(false)
})

describe('create', function () {
  test('default create', () => {
    const reducer = factory.create('foo:abc')
    expect(reducer.hasEmptyConditional).toBe(false)
    expect(reducer.asCollection).toBe(false)
    expect(reducer.type).toBe('ReducerEntity')
    expect(reducer.name).toBe('abc')
    expect(reducer.entityType).toBe('foo')
  })

  test('as collection', () => {
    const reducer = factory.create('foo:abc[]')
    expect(reducer.asCollection).toBe(true)
    expect(reducer.hasEmptyConditional).toBe(false)
    expect(reducer.type).toBe('ReducerEntity')
    expect(reducer.name).toBe('abc')
    expect(reducer.entityType).toBe('foo')
  })

  test('with conditional', () => {
    const reducer = factory.create('?foo:abc')
    expect(reducer.hasEmptyConditional).toBe(true)
    expect(reducer.asCollection).toBe(false)
    expect(reducer.type).toBe('ReducerEntity')
    expect(reducer.name).toBe('abc')
    expect(reducer.entityType).toBe('foo')
  })

  test('with conditional and as collection', () => {
    const reducer = factory.create('?foo:abc[]')
    expect(reducer.hasEmptyConditional).toBe(true)
    expect(reducer.asCollection).toBe(true)
    expect(reducer.type).toBe('ReducerEntity')
    expect(reducer.name).toBe('abc')
    expect(reducer.entityType).toBe('foo')
  })
})
