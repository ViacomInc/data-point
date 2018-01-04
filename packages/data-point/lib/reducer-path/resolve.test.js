/* eslint-env jest */
'use strict'

const reducerPath = require('./index')
const AccumulatorFactory = require('../accumulator/factory')

describe('resolve#transform.resolve', () => {
  function resolve (value, rawReducer) {
    const locals = {
      a: ['testA']
    }
    const accumulator = AccumulatorFactory.create({
      value,
      locals
    })

    return reducerPath.resolve(accumulator, reducerPath.create(rawReducer))
  }

  test('resolve current value', () => {
    const expected = {
      a: 1
    }
    return resolve(expected, '$.').then(res => expect(res.value).toBe(expected))
  })

  test('resolve to context scope', () => {
    const expected = {
      a: 1
    }
    return resolve(expected, '$..value').then(res =>
      expect(res.value).toBe(expected)
    )
  })

  test('resolve to context scope, access locals', () => {
    return resolve({}, '$..locals.a[0]').then(res =>
      expect(res.value).toBe('testA')
    )
  })
})
