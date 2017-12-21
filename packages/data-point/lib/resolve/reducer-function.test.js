/* eslint-env jest */
'use strict'

const AccumulatorFactory = require('../accumulator/factory')
const reducerFactory = require('../reducer/factory')
const resolveFunction = require('./reducer-function')
const createTransform = require('../transform-expression').create

describe('resolve#filter.resolve', () => {
  test('resolves node style callback', () => {
    const accumulator = AccumulatorFactory.create({
      value: 'test'
    })

    const reducer = reducerFactory.create(createTransform, (acc, done) =>
      done(null, `${acc.value}node`)
    )

    return resolveFunction.resolve(accumulator, reducer).then(result => {
      expect(result.value).toBe('testnode')
    })
  })

  test('resolves a sync function', () => {
    const accumulator = AccumulatorFactory.create({
      value: 'test'
    })

    const reducer = reducerFactory.create(
      createTransform,
      acc => `${acc.value}sync`
    )

    return resolveFunction.resolve(accumulator, reducer).then(result => {
      expect(result.value).toBe('testsync')
    })
  })

  test('resolves a promise function', () => {
    const accumulator = AccumulatorFactory.create({
      value: 'test'
    })

    const reducer = reducerFactory.create(createTransform, acc =>
      Promise.resolve(`${acc.value}promise`)
    )

    return resolveFunction.resolve(accumulator, reducer).then(result => {
      expect(result.value).toBe('testpromise')
    })
  })

  test('rejects if callback passes error as first param', () => {
    const accumulator = AccumulatorFactory.create({
      value: 'test'
    })

    const reducer = reducerFactory.create(createTransform, (acc, done) => {
      return done(new Error('Test'))
    })

    return resolveFunction
      .resolve(accumulator, reducer)
      .catch(err => err)
      .then(err => {
        expect(err).toHaveProperty('message', 'Test')
      })
  })
})
