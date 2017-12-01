/* eslint-env jest */
'use strict'

const _ = require('lodash')

const Filters = require('./filters')

let filters

it('setup', () => {
  filters = Filters.create()
})

it('filters#getStore', () => {
  const result = filters.getStore()
  expect.assertions(1)
  expect(_.isObject(result)).toBeTruthy()
})

it('filters#add', () => {
  const result = filters.add('foo', () => 'foo')
  expect.assertions(3)
  expect(_.isFunction(result.foo)).toBeTruthy()

  const doNotAllowOverride = _.attempt(filters.add, 'foo', () => 'foo')
  expect(_.isError(doNotAllowOverride)).toBeTruthy()

  const allowOverrideWithFlag = _.attempt(filters.add, 'foo', () => 'foo', true)
  expect(!_.isError(allowOverrideWithFlag)).toBeTruthy()
})

it('filters#get', () => {
  filters.add('_', _)
  const result = filters.get('_.isArray')
  expect.assertions(1)
  expect(_.isFunction(result)).toBeTruthy()
})

it('filters#get invalid filter', () => {
  const result = _.attempt(filters.get, 'DOES_NOT_EXISTS')
  expect.assertions(1)
  expect(result instanceof Error).toBeTruthy()
})

it('filters#clear', () => {
  filters.clear()
  expect.assertions(1)
  expect(Object.keys(filters.getStore()).length).toBe(0)
})
