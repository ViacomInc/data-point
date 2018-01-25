/* eslint-env jest */

const _ = require('lodash')
const helpers = require('./helpers')

describe('helpers.reducify', () => {
  test('pass simple', () => {
    const rpick = helpers.reducify(_.pick)
    const input = ['a', 'c']
    const value = { a: 1, b: 2, c: 3 }
    expect(rpick(input)(value)).toEqual({ a: 1, c: 3 })
  })

  test('pass error', () => {
    const rTest = helpers.reducify(() => {
      throw new Error('testerror')
    })
    expect(() => {
      rTest()({})
    }).toThrow()
  })
})

describe('helpers.reducifyAll', () => {
  test('reducify all keys', () => {
    const rLodash = helpers.reducifyAll(_)
    const input = ['a', 'c']
    const value = { a: 1, b: 2, c: 3 }
    const keys = Object.keys(rLodash)
    expect(keys.length).toBeGreaterThan(10)
    expect(rLodash.pick(input)(value)).toEqual({ a: 1, c: 3 })
  })

  test('reducify specific keys', () => {
    const rLodash = helpers.reducifyAll(_, ['pick', 'map', 'find'])
    const input = ['a', 'c']
    const value = { a: 1, b: 2, c: 3 }
    const keys = Object.keys(rLodash)
    expect(keys).toEqual(['pick', 'map', 'find'])
    expect(rLodash.pick(input)(value)).toEqual({ a: 1, c: 3 })
  })
})

describe('helpers.mockReducer', () => {
  test('test reducerTest', () => {
    const reducerTest = a => (value, acc, done) => {
      done(null, value * a)
    }

    return helpers.mockReducer(reducerTest(2), { value: 100 }).then(result => {
      expect(result.value).toBe(200)
    })
  })
})

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

describe('helpers.createReducerResolver', () => {
  test('It should partially apply dataPoint to method', () => {
    const resolveReducerBound = helpers.createReducerResolver({})
    expect(resolveReducerBound.length).toEqual(2)
  })
})
