/* eslint-env jest */
'use strict'

const _ = require('lodash')
const EntityType = require('./entity-types')

const FooEntityType = (() => {
  function create (spec) {
    // body;
  }

  function resolve (accumulator, resolveReducer) {
    // body;
  }

  return {
    create,
    resolve
  }
})()

let entityTypes

it('setup', () => {
  entityTypes = EntityType.create()
})

it('source#getStore', () => {
  const result = entityTypes.getStore()
  expect.assertions(1)
  expect(_.isObject(result)).toBeTruthy()
})

it('source#add/get', () => {
  entityTypes.add('foo', FooEntityType)

  const foo = entityTypes.get('foo')

  expect.assertions(2)
  expect(_.isFunction(foo.create)).toBeTruthy()

  const doNotAllowOverride = _.attempt(entityTypes.add, 'foo', {})
  expect(_.isError(doNotAllowOverride)).toBeTruthy()
})

it('source#get invalid id', () => {
  const result = _.attempt(entityTypes.get, 'DOES_NOT_EXISTS')
  expect.assertions(1)
  expect(result instanceof Error).toBeTruthy()
})

it('source#get', () => {
  entityTypes.add('request:a1', FooEntityType)
  const result = entityTypes.get('foo')
  expect.assertions(1)
  expect(_.isFunction(result.create)).toBeTruthy()
})

it('teardown', () => {
  entityTypes.clear()
})
