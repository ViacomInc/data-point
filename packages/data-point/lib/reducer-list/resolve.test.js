/* eslint-env jest */
'use strict'

const nock = require('nock')

const createReducerList = require('./index').create
const resolveReducerList = require('./index').resolve
const createTransform = require('../reducer').create
const resolveTransform = require('../reducer').resolve
const AccumulatorFactory = require('../accumulator/factory')

const fixtureStore = require('../../test/utils/fixture-store')
const testData = require('../../test/data.json')

let manager

beforeAll(() => {
  manager = fixtureStore.create()
})

test('resolve#reducer.resolve - reducer empty', () => {
  const accumulator = AccumulatorFactory.create({
    value: testData.a.g
  })

  const reducerList = createReducerList(createTransform, '')

  return resolveReducerList(
    manager,
    resolveTransform,
    accumulator,
    reducerList
  ).then(result => expect(result.value).toEqual(testData.a.g))
})

describe('resolve#reducer.resolve - reducer transform', () => {
  test('only transform', () => {
    const accumulator = AccumulatorFactory.create({
      value: testData
    })

    const reducerList = createReducerList(createTransform, '$a.g')

    return resolveReducerList(
      manager,
      resolveTransform,
      accumulator,
      reducerList
    ).then(result => expect(result.value).toEqual(testData.a.g))
  })

  test('multiple transforms', () => {
    const accumulator = AccumulatorFactory.create({
      value: testData
    })

    const reducerList = createReducerList(createTransform, '$a.g | $g1')

    return resolveReducerList(
      manager,
      resolveTransform,
      accumulator,
      reducerList
    ).then(result => expect(result.value).toBe(1))
  })
})

describe('resolve#reducer.resolve - reducer model', () => {
  test('simplest model', () => {
    const accumulator = AccumulatorFactory.create({
      value: testData
    })

    const reducerList = createReducerList(createTransform, 'hash:asIs')

    return resolveReducerList(
      manager,
      resolveTransform,
      accumulator,
      reducerList
    ).then(result => expect(result.value).toEqual(testData))
  })

  test('multiple models', () => {
    const accumulator = AccumulatorFactory.create({
      value: testData
    })

    const reducerList = createReducerList(createTransform, 'hash:asIs | hash:a.1')

    return resolveReducerList(
      manager,
      resolveTransform,
      accumulator,
      reducerList
    ).then(result => expect(result.value).toEqual(testData.a.h))
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

    const reducerList = createReducerList(createTransform, 'request:a1')

    return resolveReducerList(
      manager,
      resolveTransform,
      accumulator,
      reducerList
    ).then(result =>
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

    const transform = createReducerList(
      createTransform,
      'request:a1 | request:a3'
    )

    return resolveReducerList(
      manager,
      resolveTransform,
      accumulator,
      transform
    ).then(result =>
      expect(result.value).toEqual({
        ok: true
      })
    )
  })
})
