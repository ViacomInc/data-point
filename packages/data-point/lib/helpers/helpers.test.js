/* eslint-env jest */
'use strict'

const helpers = require('./helpers')

describe('helpers.createAccumulator', () => {
  test('It should assign value', () => {
    const acc = helpers.createAccumulator('foo')
    expect(acc).toHaveProperty('value', 'foo')
  })
  test('It should accept options to merge with value', () => {
    const acc = helpers.createAccumulator('foo', {
      context: 'bar'
    })
    expect(acc).toHaveProperty('value', 'foo')
    expect(acc).toHaveProperty('context', 'bar')
  })
})

describe('helpers.createResolveTransform', () => {
  test('It should partially apply dataPoint to method', () => {
    const resolveTransform = helpers.createResolveTransform({})
    expect(resolveTransform.length).toEqual(2)
  })
})

describe('isTransform', () => {
  test('It should recognize as transform', () => {
    expect(helpers.isTransform(helpers.createTransform([]))).toBe(true)
  })
})
