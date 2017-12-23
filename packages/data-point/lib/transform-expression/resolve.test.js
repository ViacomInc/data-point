/* eslint-env jest */
'use strict'

const nock = require('nock')

const fixtureStore = require('../../test/utils/fixture-store')
const reducers = require('../../test/utils/reducers')
const testData = require('../../test/data.json')

const AccumulatorFactory = require('../accumulator/factory')
const reducerFactory = require('../reducer/factory')
const TransformExpression = require('./factory')

const ResolveTransform = require('./resolve')

let store

beforeAll(() => {
  store = fixtureStore.create()
})

describe('reducer.getReducerFunction', () => {
  test('resolve to ReducerPath', () => {
    const resolver = ResolveTransform.getReducerFunction(store, 'ReducerPath')
    expect(resolver).toBeInstanceOf(Function)
  })
  test('resolve to ReducerFunction', () => {
    const resolver = ResolveTransform.getReducerFunction(
      store,
      'ReducerFunction'
    )
    expect(resolver).toBeInstanceOf(Function)
  })
  test('resolve to ReducerEntity', () => {
    const resolver = ResolveTransform.getReducerFunction(store, 'ReducerEntity')
    expect(resolver).toBeInstanceOf(Function)
  })
  test('resolve to ReducerEntity', () => {
    expect(() => {
      ResolveTransform.getReducerFunction(store, 'INVALID TYPE')
    }).toThrow()
  })
})

test('resolve#reducer.resolveReducer', () => {
  const accumulator = AccumulatorFactory.create({
    value: testData.a.b.c
  })

  const reducer = reducerFactory.create(
    TransformExpression.create,
    reducers.addCollectionValues()
  )
  return ResolveTransform.resolveReducer(store, accumulator, reducer).then(
    result => {
      expect(result.value).toEqual(6)
    }
  )
})

test('resolve#reducer.resolve - reducer empty', () => {
  const accumulator = AccumulatorFactory.create({
    value: testData.a.g
  })

  const transform = TransformExpression.create('')

  return ResolveTransform.resolve(store, accumulator, transform).then(result =>
    expect(result.value).toEqual(testData.a.g)
  )
})

describe('resolve#reducer.resolve - reducer transform', () => {
  test('only transform', () => {
    const accumulator = AccumulatorFactory.create({
      value: testData
    })

    const transform = TransformExpression.create('$a.g')
    return ResolveTransform.resolve(store, accumulator, transform).then(
      result => expect(result.value).toEqual(testData.a.g)
    )
  })

  test('multiple transforms', () => {
    const accumulator = AccumulatorFactory.create({
      value: testData
    })

    const transform = TransformExpression.create('$a.g | $g1')

    return ResolveTransform.resolve(store, accumulator, transform).then(
      result => expect(result.value).toBe(1)
    )
  })
})

describe('resolve#reducer.resolve - reducer model', () => {
  test('simplest model', () => {
    const accumulator = AccumulatorFactory.create({
      value: testData
    })

    const transform = TransformExpression.create('hash:asIs')
    return ResolveTransform.resolve(store, accumulator, transform).then(
      result => expect(result.value).toEqual(testData)
    )
  })

  test('multiple models', () => {
    const accumulator = AccumulatorFactory.create({
      value: testData
    })

    const transform = TransformExpression.create('hash:asIs | hash:a.1')

    return ResolveTransform.resolve(store, accumulator, transform).then(
      result => expect(result.value).toEqual(testData.a.h)
    )
  })
})

describe('resolve#reducer.resolve - reducer request', () => {
  test('simplest request', () => {
    nock('http://remote.test')
      .get('/source1')
      .reply(200, {
        ok: true
      })

    const accumulator = AccumulatorFactory.create({
      value: testData.foo
    })

    const transform = TransformExpression.create('request:a1')
    return ResolveTransform.resolve(store, accumulator, transform).then(
      result =>
        expect(result.value).toEqual({
          ok: true
        })
    )
  })

  test('multiple models', () => {
    nock('http://remote.test')
      .get('/source1')
      .reply(200, {
        itemPath: '/source2'
      })

    nock('http://remote.test')
      .get('/source2')
      .reply(200, {
        ok: true
      })

    const accumulator = AccumulatorFactory.create({
      value: testData
    })

    const transform = TransformExpression.create('request:a1 | request:a3')

    return ResolveTransform.resolve(store, accumulator, transform).then(
      result =>
        expect(result.value).toEqual({
          ok: true
        })
    )
  })
})
