/* eslint-env jest */
'use strict'

const AccumulatorFactory = require('../accumulator/factory')
const reducerFactory = require('../reducer/factory')
const resolveFunction = require('./reducer-function')

const fixtureStore = require('../../test/utils/fixture-store')

const testData = require('../../test/data.json')

let store

beforeAll(() => {
  store = fixtureStore.create()
})

describe('resolve#filter.resolve', () => {
  test('error if reducer does not return a function', () => {
    const accumulator = AccumulatorFactory.create({
      value: testData.a.b.c
    })

    const reducer = reducerFactory.create('test.invalidReducer()')

    return resolveFunction
      .resolve(store.filters, accumulator, reducer)
      .catch(reson => {
        expect(reson).toBeInstanceOf(Error)
        expect(reson.name).toBe('InvalidType')
        expect(reson.message.includes('function')).toBe(true)
      })
  })

  test('error if reducer has wrong arity', () => {
    const accumulator = AccumulatorFactory.create({
      value: testData.a.b.c
    })

    const reducer = reducerFactory.create('test.invalidReducerArity()')

    return resolveFunction
      .resolve(store.filters, accumulator, reducer)
      .catch(reson => {
        expect(reson).toBeInstanceOf(Error)
        expect(reson.name).toBe('InvalidArity')
        expect(reson.message.includes('arity')).toBe(true)
      })
  })

  test('resolves a registered function', () => {
    const accumulator = AccumulatorFactory.create({
      value: testData.a.b.c
    })

    const reducer = reducerFactory.create('test.addCollectionValues()')

    return resolveFunction
      .resolve(store.filters, accumulator, reducer)
      .then(result => {
        expect(result.value).toBe(6)
      })
  })

  test('resolves an actual function (none string)', () => {
    const accumulator = AccumulatorFactory.create({
      value: testData.foo
    })

    const reducer = reducerFactory.create((acc, done) =>
      done(null, `${acc.value}one`)
    )

    return resolveFunction
      .resolve(store.filters, accumulator, reducer)
      .then(result => {
        expect(result.value).toBe('1one')
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
      .resolve(store.filters, accumulator, reducer)
      .catch(err => err)
      .then(err => {
        expect(err).toHaveProperty('message', 'Test')
      })
  })
})
