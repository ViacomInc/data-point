/* eslint-env jest */
'use strict'

const _ = require('lodash')

const Values = require('./values')

let values

it('setup', () => {
  values = Values.create()
})

it('values#getStore', () => {
  const result = values.getStore()

  expect(_.isObject(result)).toBeTruthy()
})

it('values#add', () => {
  const result = values.add('foo', 123)

  expect(result.foo).toBe(123)

  const doNotAllowOverride = _.attempt(values.add, 'foo', 123)
  expect(_.isError(doNotAllowOverride)).toBeTruthy()

  const allowOverrideWithFlag = _.attempt(values.add, 'foo', 123, true)
  expect(!_.isError(allowOverrideWithFlag)).toBeTruthy()
})

it('values#get', () => {
  values.add('abc', {
    b: 1
  })
  const result = values.get('abc.b')
  expect(result).toBe(1)
})

it('values#get invalid filter', () => {
  const result = _.attempt(values.get, 'DOES_NOT_EXISTS')

  expect(result instanceof Error).toBeTruthy()
})

it('values#clear', () => {
  values.clear()

  expect(Object.keys(values.getStore()).length).toBe(0)
})
