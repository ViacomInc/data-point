/* eslint-env jest */

const requestFactory = require('./factory')
const createReducer = require('../../reducer-types').create
const requests = require('../../../test/definitions/requests')
const { isReducer } = require('../../reducer-types')

describe('create', () => {
  let request
  beforeAll(() => {
    const requestSpec = requests['request:a0.1']
    request = requestFactory.create(createReducer, requestSpec)
  })
  test('It should have defaults', () => {
    expect(request).toHaveProperty('id')
    expect(request).not.toHaveProperty('before')
    expect(request).not.toHaveProperty('after')
    expect(request).not.toHaveProperty('error')
    expect(request).toHaveProperty('params')
  })
  test('It should have a url', () => {
    expect(request).toHaveProperty('url')
  })
  test('It should have an options reducer', () => {
    expect(isReducer(request.options)).toBe(true)
  })
  test('It should have the default options reducer', () => {
    const newRequest = requestFactory.create(
      createReducer,
      requests['request:a1.0']
    )
    expect(isReducer(newRequest.options)).toBe(true)
    expect(newRequest.options.body).toEqual(requestFactory.defaultOptions)
  })
})

describe('factory#defaultOptions', () => {
  test('It should return an empty object', () => {
    expect(requestFactory.defaultOptions()).toEqual({})
  })
})
