/* eslint-env jest */
'use strict'

const _ = require('lodash')
const helpers = require('./helpers')

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

describe('helpers.createEntity', () => {
  test('It should create entity defaults', () => {
    function FooEntity () {}
    const entity = helpers.createEntity(
      FooEntity,
      {
        before: '$.',
        value: '$.',
        error: '$.',
        after: '$.'
      },
      'foo'
    )

    expect(entity).toHaveProperty('id', 'foo')
    expect(entity).toHaveProperty('value.typeOf', 'TransformExpression')
    expect(entity).toHaveProperty('error.typeOf', 'TransformExpression')
    expect(entity).toHaveProperty('after.typeOf', 'TransformExpression')
    expect(entity).toHaveProperty('params', {})
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

describe('helpers.createResolveTransform', () => {
  test('It should partially apply dataPoint to method', () => {
    const resolveTransform = helpers.createResolveTransform({})
    expect(resolveTransform.length).toEqual(2)
  })
})

describe('isTransform', () => {
  test('It should recognize as transform', () => {
    expect(helpers.isTransform(helpers.createTransform([]))).toBe(true)
  })
})
