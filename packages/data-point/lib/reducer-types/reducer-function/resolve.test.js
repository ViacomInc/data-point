/* eslint-env jest */

const reducerFactory = require('../factory')
const resolveFunction = require('./resolve')
const resolveReducer = require('../index').resolve
const AccumulatorFactory = require('../../accumulator/factory')
const FixtureStore = require('../../../test/utils/fixture-store')

let dataPoint

beforeAll(() => {
  dataPoint = FixtureStore.create()
})

describe('resolve#filter.resolve', () => {
  test('resolves node style callback', () => {
    const accumulator = AccumulatorFactory.create({
      value: 'test'
    })

    const reducer = reducerFactory.create((acc, done) =>
      done(null, `${acc.value}node`)
    )

    return resolveFunction
      .resolve(dataPoint, resolveReducer, accumulator, reducer, [])
      .then(result => {
        expect(result.value).toBe('testnode')
      })
  })

  test('resolves a sync function', () => {
    const accumulator = AccumulatorFactory.create({
      value: 'test'
    })

    const reducer = reducerFactory.create(acc => `${acc.value}sync`)

    return resolveFunction
      .resolve(dataPoint, resolveReducer, accumulator, reducer, [])
      .then(result => {
        expect(result.value).toBe('testsync')
      })
  })

  test('resolves a promise function', () => {
    const accumulator = AccumulatorFactory.create({
      value: 'test'
    })

    const reducer = reducerFactory.create(acc =>
      Promise.resolve(`${acc.value}promise`)
    )

    return resolveFunction
      .resolve(dataPoint, resolveReducer, accumulator, reducer, [])
      .then(result => {
        expect(result.value).toBe('testpromise')
      })
  })

  test('rejects if callback passes error as first param', () => {
    const accumulator = AccumulatorFactory.create({
      value: 'test'
    })

    const reducer = reducerFactory.create((acc, done) => {
      return done(new Error('Test'))
    })

    return resolveFunction
      .resolve(dataPoint, resolveReducer, accumulator, reducer, [])
      .catch(err => err)
      .then(err => {
        expect(err).toHaveProperty('message', 'Test')
      })
  })
})
