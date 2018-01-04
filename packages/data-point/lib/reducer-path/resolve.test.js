/* eslint-env jest */
'use strict'

const reducerPath = require('./index')
const AccumulatorFactory = require('../accumulator/factory')

describe('ReducerPath#resolve', () => {
  function resolve (value, reducerSource) {
    const locals = {
      a: ['testA']
    }
    const accumulator = AccumulatorFactory.create({
      value,
      locals
    })

    return reducerPath.resolve(accumulator, reducerPath.create(reducerSource))
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
