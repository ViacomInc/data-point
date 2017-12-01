/* eslint-env jest */
'use strict'

const factory = require('./factory')

test('reducer/reducer-entity#isEntity', () => {
  expect(factory.isEntity('a')).not.toBe('is not Entity')
  expect(factory.isEntity('#a')).not.toBe('is not Entity')
  expect(factory.isEntity('#ab')).not.toBe('is not Entity')
  expect(factory.isEntity('$ab:abc')).not.toBe('is not Entity')
  expect(factory.isEntity('abc:abc')).toBeTruthy()
  expect(factory.isEntity('#abc:abc')).toBeTruthy()
  expect(factory.isEntity('abc:abc[]')).toBeTruthy()
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
