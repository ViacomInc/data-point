/* eslint-env jest */
'use strict'

const AccumulatorFactory = require('../accumulator/factory')
const reducerFactory = require('../reducer/factory')
const reducerPath = require('../reducer-path')

describe('resolve#transform.resolve', () => {
  function resolve (value, rawReducer) {
    const locals = {
      a: ['testA']
    }
    const filtercontext = AccumulatorFactory.create({
      value,
      locals
    })

    return reducerPath.resolve(filtercontext, reducerFactory.create(rawReducer))
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
