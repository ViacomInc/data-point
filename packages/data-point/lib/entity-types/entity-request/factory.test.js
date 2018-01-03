/* eslint-env jest */
'use strict'

const requests = require('../../../test/definitions/requests')

const requestFactory = require('./factory')

describe('create', () => {
  let request
  beforeAll(() => {
    const requestSpec = requests['request:a0.1']
    request = requestFactory.create(requestSpec)
  })
  test('It should have defaults', () => {
    expect(request).toHaveProperty('id')
    expect(request).toHaveProperty('before')
    expect(request).toHaveProperty('after')
    expect(request).toHaveProperty('error')
    expect(request).toHaveProperty('params')
  })
  test('It should have url', () => {
    expect(request).toHaveProperty('url')
  })
  test('It should have options with out any transform keys', () => {
    expect(request).toHaveProperty('options')
    expect(request.options).toEqual({
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
    expect(request).toHaveProperty('transformOptionKeys')
    expect(request.transformOptionKeys).toHaveLength(2)
    request.transformOptionKeys.forEach(element => {
      expect(element).toHaveProperty('path')
      expect(element).toHaveProperty('transform')
      expect(element.transform).toHaveProperty('type', 'ReducerFunction')
    }, this)
  })
})
