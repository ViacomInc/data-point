/* eslint-env jest */

const _ = require('lodash')
const helpers = require('./helpers')

const ReducerEntity = require('../reducer-types/reducer-entity/factory')
  .ReducerEntity
const ReducerFunction = require('../reducer-types/reducer-function/factory')
  .ReducerFunction
const ReducerList = require('../reducer-types/reducer-list/factory').ReducerList
const ReducerObject = require('../reducer-types/reducer-object/factory')
  .ReducerObject
const ReducerPath = require('../reducer-types/reducer-path/factory').ReducerPath

describe('helpers.reducify', () => {
  test('pass simple', done => {
    const rpick = helpers.reducify(_.pick)
    const input = ['a', 'c']
    const acc = {
      value: { a: 1, b: 2, c: 3 }
    }
    rpick(input)(acc, (err, value) => {
      /* eslint handle-callback-err: 0 */
      expect(value).toEqual({ a: 1, c: 3 })
      done()
    })
  })

  test('pass error', done => {
    const rTest = helpers.reducify(() => {
      return new Error('testerror')
    })
    rTest()({}, (err, value) => {
      /* eslint handle-callback-err: 0 */
      expect(err).toBeInstanceOf(Error)
      done()
    })
  })
})

describe('helpers.reducifyAll', () => {
  test('reducify all keys', done => {
    const rLodash = helpers.reducifyAll(_)
    const input = ['a', 'c']
    const acc = {
      value: { a: 1, b: 2, c: 3 }
    }
    const keys = Object.keys(rLodash)
    expect(keys.length).toBeGreaterThan(10)
    rLodash.pick(input)(acc, (err, value) => {
      /* eslint handle-callback-err: 0 */
      expect(value).toEqual({ a: 1, c: 3 })
      done()
    })
  })

  test('reducify specificy keys', done => {
    const rLodash = helpers.reducifyAll(_, ['pick', 'map', 'find'])
    const input = ['a', 'c']
    const acc = {
      value: { a: 1, b: 2, c: 3 }
    }
    const keys = Object.keys(rLodash)
    expect(keys).toEqual(['pick', 'map', 'find'])
    rLodash.pick(input)(acc, (err, value) => {
      /* eslint handle-callback-err: 0 */
      expect(value).toEqual({ a: 1, c: 3 })
      done()
    })
  })
})

describe('helpers.mockReducer', () => {
  test('test reducerTest', () => {
    const reducerTest = a => (acc, done) => {
      done(null, acc.value * a)
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
    expect(resolveReducerBound.length).toEqual(3)
  })
})

describe('helpers.isReducer', () => {
  test('It should return true for reducers', () => {
    expect(helpers.isReducer()).toBe(false)
    expect(helpers.isReducer({})).toBe(false)
    expect(helpers.isReducer([])).toBe(false)
    expect(helpers.isReducer({ type: 'ReducerPath' })).toBe(false)
    expect(helpers.isReducer(new ReducerEntity())).toBe(true)
    expect(helpers.isReducer(new ReducerFunction())).toBe(true)
    expect(helpers.isReducer(new ReducerList())).toBe(true)
    expect(helpers.isReducer(new ReducerObject())).toBe(true)
    expect(helpers.isReducer(new ReducerPath())).toBe(true)
  })
})
