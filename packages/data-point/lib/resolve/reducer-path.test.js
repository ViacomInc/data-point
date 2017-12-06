/* eslint-env jest */
'use strict'

const AccumulatorFactory = require('../accumulator/factory')
const reducerFactory = require('../reducer/factory')
const reducerPath = require('./reducer-path')
const resolveReducer = require('./reducer')

const fixtureStore = require('../../test/utils/fixture-store')

let store

beforeAll(() => {
  store = fixtureStore.create()
})

describe('resolve#reducer-path.resolveObjectPath', () => {
  test('resolve $. to entire value', () => {
    const acc = {
      value: 'test'
    }
    const result = reducerPath.resolveObjectPath(acc, '.')
    expect(result).toBe('test')
  })

  test('resolve "empty" jsonpath to entire value', () => {
    const acc = {
      value: 'test'
    }
    const result = reducerPath.resolveObjectPath(acc)
    expect(result).toBe('test')
  })

  test('resolve valid jsonpath to resolved value', () => {
    const acc = {
      value: {
        a: ['test']
      }
    }
    const result = reducerPath.resolveObjectPath(acc, 'a[0]')
    expect(result).toBe('test')
  })

  test('resolve valid collection path to resolved value', () => {
    const acc = {
      value: {
        a: {
          b: [
            {
              c: 1
            },
            {
              c: 2
            },
            {
              c: 3
            }
          ]
        }
      }
    }
    const result = reducerPath.resolveObjectPath(acc, 'a.b.c[]')
    expect(result).toEqual([1, 2, 3])
  })

  test('resolve prefixe ".." with valid jsonpath to resolved value', () => {
    const acc = {
      value: {
        a: ['test']
      },
      locals: 'test2'
    }
    let result = reducerPath.resolveObjectPath(acc, '..value.a[0]')
    expect(result).toBe('test')
    result = reducerPath.resolveObjectPath(acc, '..locals')
    expect(result).toBe('test2')
  })
})

describe('resolve#transform.resolve', () => {
  function resolve (value, rawReducer) {
    const locals = {
      a: ['testA']
    }
    const filtercontext = AccumulatorFactory.create({
      value,
      locals
    })

    return reducerPath.resolve(
      store,
      resolveReducer.resolve,
      filtercontext,
      reducerFactory.create(rawReducer)
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
