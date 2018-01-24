/* eslint-env jest */

const nock = require('nock')

const createReducerList = require('./index').create
const resolveReducerList = require('./index').resolve
const createReducer = require('../index').create
const resolveReducer = require('../index').resolve
const AccumulatorFactory = require('../../accumulator/factory')

const fixtureStore = require('../../../test/utils/fixture-store')
const testData = require('../../../test/data.json')

let manager

beforeAll(() => {
  manager = fixtureStore.create()
})

test('resolve#reducer.resolve - reducer empty', () => {
  const accumulator = AccumulatorFactory.create({
    value: testData.a.g
  })

  const reducerList = createReducerList(createReducer, '')

  return resolveReducerList(
    manager,
    resolveReducer,
    accumulator,
    reducerList
  ).then(result => expect(result.value).toEqual(testData.a.g))
})

describe('resolve#reducer.resolve - with valid reducers', () => {
  test('one reducer', () => {
    const accumulator = AccumulatorFactory.create({
      value: testData
    })

    const reducerList = createReducerList(createReducer, '$a.g')

    return resolveReducerList(
      manager,
      resolveReducer,
      accumulator,
      reducerList
    ).then(result => expect(result.value).toEqual(testData.a.g))
  })

  test('multiple reducers', () => {
    const accumulator = AccumulatorFactory.create({
      value: testData
    })

    const reducerList = createReducerList(createReducer, '$a.g | $g1')

    return resolveReducerList(
      manager,
      resolveReducer,
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

    const reducerList = createReducerList(createReducer, 'hash:asIs')

    return resolveReducerList(
      manager,
      resolveReducer,
      accumulator,
      reducerList
    ).then(result => expect(result.value).toEqual(testData))
  })

  test('it returns original input after piping through hash:asIs', () => {
    const accumulator = AccumulatorFactory.create({
      value: testData
    })

    const reducerList = createReducerList(createReducer, 'hash:asIs | hash:a.1')

    return resolveReducerList(
      manager,
      resolveReducer,
      accumulator,
      reducerList
    ).then(result => {
      expect(result.value).toEqual(testData.a.h)
    })
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

    const reducerList = createReducerList(createReducer, 'request:a1')

    return resolveReducerList(
      manager,
      resolveReducer,
      accumulator,
      reducerList
    ).then(result =>
      expect(result.value).toEqual({
        ok: true
      })
    )
  })

  test('multiple models for reducer request', () => {
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

    const reducer = createReducerList(createReducer, 'request:a1 | request:a3')

    return resolveReducerList(
      manager,
      resolveReducer,
      accumulator,
      reducer
    ).then(result => {
      expect(result.value).toEqual({
        ok: true
      })
    })
  })
})
