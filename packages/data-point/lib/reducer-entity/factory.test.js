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
  expect(factory.isEntity('abc:ab-c-')).toBe(true)
  expect(factory.isEntity('_abc:abc')).toBe(true)
  expect(factory.isEntity('#abc:abc')).toBe(true)
  expect(factory.isEntity('abc:abc[]')).toBe(true)
  expect(factory.isEntity('abc:abc[][]')).toBe(false)
  expect(factory.isEntity('abc:abc[]d')).toBe(false)
})

test('reducer/reducer-entity#create', () => {
  const reducer = factory.create('foo:abc')
  expect(reducer.type).toBe('ReducerEntity')
  expect(reducer.name).toBe('abc')
  expect(reducer.entityType).toBe('foo')
})

test('reducer/reducer-entity#create as collection of', () => {
  const reducer = factory.create('foo:abc[]')
  expect(reducer.asCollection).toBe(true)
  expect(reducer.type).toBe('ReducerEntity')
  expect(reducer.name).toBe('abc')
  expect(reducer.entityType).toBe('foo')
})
