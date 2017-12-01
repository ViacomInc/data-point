/* eslint-env jest */
'use strict'

const _ = require('lodash')
const storeEntities = require('./entities')
const storeEntityTypes = require('./entity-types')
const sourceDefinitions = require('../../test/definitions/entities')

const EntityRequest = require('../entity-types/entity-request')

let entities

it('setup', () => {
  const entityTypes = storeEntityTypes.create()
  entityTypes.add('request', EntityRequest)
  entities = storeEntities.create(entityTypes)
})

it('source#getStore', () => {
  const result = entities.getStore()
  expect.assertions(1)
  expect(_.isObject(result)).toBeTruthy()
})

it('source#add/get', () => {
  entities.add('request:a0.1', sourceDefinitions['request:a0.1'])

  const foo = entities.get('request:a0.1')

  expect.assertions(2)
  expect(foo.url).toBe('http://some.path')

  const doNotAllowOverride = _.attempt(entities.add, 'request:a0.1', {})
  expect(_.isError(doNotAllowOverride)).toBeTruthy()
})

it('source#get invalid id', () => {
  const result = _.attempt(entities.get, 'DOES_NOT_EXISTS')
  expect.assertions(1)
  expect(result instanceof Error).toBeTruthy()
})

it('source#get', () => {
  entities.add('request:a1', sourceDefinitions['request:a1'])
  const result = entities.get('request:a1')
  expect.assertions(1)
  expect(result.url).toBe('http://remote.test/source1')
})

it('teardown', () => {
  entities.clear()
})
