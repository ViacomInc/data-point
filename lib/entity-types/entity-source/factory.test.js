/* eslint-env jest */
'use strict'

const sources = require('../../../test/definitions/sources')

const sourceFactory = require('./factory')
const helpers = require('../../helpers')

describe('create', () => {
  let source
  beforeAll(() => {
    const sourceSpec = sources['source:a0.1']
    source = sourceFactory.create(sourceSpec)
  })
  test('It should have defaults', () => {
    expect(source).toHaveProperty('id')
    expect(source).toHaveProperty('before')
    expect(source).toHaveProperty('after')
    expect(source).toHaveProperty('error')
    expect(source).toHaveProperty('params')
  })
  test('It should have url', () => {
    expect(source).toHaveProperty('url')
  })
  test('It should have options with out any transform keys', () => {
    expect(source).toHaveProperty('options')
    expect(source.options).toEqual({
      dataType: 'json',
      method: 'POST',
      qs: {
        varKey2: 1,
        varKey3: true
      },
      timeout: 1000,
      username: '$username$'
    })
  })
  test('It should have transformOptionKeys', () => {
    expect(source).toHaveProperty('transformOptionKeys')
    expect(source.transformOptionKeys).toHaveLength(2)
    source.transformOptionKeys.forEach(element => {
      expect(element).toHaveProperty('path')
      expect(element).toHaveProperty('transform')
      expect(helpers.isTransform(element.transform)).toBe(true)
    }, this)
  })
})
