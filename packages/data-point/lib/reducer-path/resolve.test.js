/* eslint-env jest */
'use strict'

const AccumulatorFactory = require('../accumulator/factory')
const reducerFactory = require('../reducer/factory')
const reducerPath = require('../reducer-path')
const createTransform = require('../transform-expression').create

describe('resolve#transform.resolve', () => {
  function resolve (value, rawReducer) {
    const locals = {
      a: ['testA']
    }
    const accumulator = AccumulatorFactory.create({
      value,
      locals
    })

    return reducerPath.resolve(
      accumulator,
      reducerFactory.create(createTransform, rawReducer)
    )
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
