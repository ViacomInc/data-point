/* eslint-env jest */
'use strict'

const ResolveEntity = require('./resolve-entity')
const ReducerEntity = require('../../reducer-entity')

const FixtureStore = require('../../../test/utils/fixture-store')
const helpers = require('../../helpers')
const utils = require('../../utils')

let dataPoint
let resolveTransform

beforeAll(() => {
  dataPoint = FixtureStore.create()
  resolveTransform = helpers.createResolveTransform(dataPoint)
})

afterEach(() => {
  dataPoint.middleware.clear()
})

describe('ResolveEntity.resolveErrorReducers', () => {
  test('It should reject if no transform set', () => {
    const err = new Error('Test')
    const accumulator = helpers.createAccumulator(
      {},
      {
        context: {
          error: helpers.createTransform([])
        }
      }
    )
    return ResolveEntity.resolveErrorReducers(
      err,
      accumulator,
      resolveTransform
    )
      .catch(reason => reason)
      .then(acc => {
        expect(acc).toBeInstanceOf(Error)
        expect(acc).toHaveProperty('message', 'Test')
      })
  })

  test('It should handle if transform set', () => {
    const err = new Error('Test')
    const accumulator = helpers.createAccumulator(
      {},
      {
        context: {
          error: helpers.createTransform((acc, next) => next(null, 'pass'))
        }
      }
    )
    return ResolveEntity.resolveErrorReducers(
      err,
      accumulator,
      resolveTransform
    ).then(acc => {
      expect(acc.value).toEqual('pass')
    })
  })
})

describe('ResolveEntity.createCurrentAccumulator', () => {
  let acc
  beforeAll(() => {
    const reducerEntity = ReducerEntity.create('hash:base')
    const accumulator = helpers.createAccumulator({
      foo: 'bar'
    })
    acc = ResolveEntity.createCurrentAccumulator(
      dataPoint,
      accumulator,
      reducerEntity
    )
  })
  test('It should set reducer property', () => {
    expect(acc).toHaveProperty('reducer.spec.id', 'hash:base')
  })
  test('It should context as the current Entity', () => {
    expect(acc).toHaveProperty('context.id', 'hash:base')
  })
  test('It should initialValue acc.value', () => {
    expect(acc).toHaveProperty('initialValue', {
      foo: 'bar'
    })
  })
  test('It should initialValue acc.value', () => {
    expect(acc).toHaveProperty('params', {
      base: true
    })
  })
})

describe('ResolveEntity.resolveMiddleware', () => {
  test('It should execute a middleware', () => {
    dataPoint.middleware.use('request:before', (acc, next) => {
      acc.value = 'bar'
      next(null)
    })

    const racc = helpers.createAccumulator('foo')
    return ResolveEntity.resolveMiddleware(
      dataPoint,
      'request:before',
      racc
    ).then(acc => {
      expect(acc.value).toEqual('bar')
    })
  })

  test('It should execute a middleware', () => {
    dataPoint.middleware.use('request:before', (acc, next) => {
      acc.resolve('bar')
      next(null)
    })

    const racc = helpers.createAccumulator('foo')
    return ResolveEntity.resolveMiddleware(dataPoint, 'request:before', racc)
      .catch(reason => reason)
      .then(reason => {
        expect(reason).toBeInstanceOf(Error)
        expect(reason).toHaveProperty('name', 'bypass')
        expect(reason).toHaveProperty('bypass', true)
        expect(reason).toHaveProperty('bypassValue.value', 'bar')
      })
  })
})

const Resolve = require('../../resolve/reducer')

describe('ResolveEntity.resolveEntity', () => {
  const defaultResolver = (acc, resolveTransform) => Promise.resolve(acc)

  const resolveEntity = (
    entityId,
    input,
    options,
    resolver = defaultResolver
  ) => {
    const racc = helpers.createAccumulator.call(null, input, options)
    const reducer = ReducerEntity.create(entityId)
    return ResolveEntity.resolveEntity(
      dataPoint,
      resolveTransform,
      racc,
      reducer,
      resolver
    )
  }

  test('It should resolve entity', () => {
    return resolveEntity('hash:asIs', 'foo').then(acc => {
      expect(acc).toHaveProperty('value', 'foo')
    })
  })

  test('It should attach entityId to error', () => {
    const rejectResolver = () => Promise.reject(new Error('test'))
    return resolveEntity('hash:asIs', undefined, undefined, rejectResolver)
      .catch(error => error)
      .then(val => {
        expect(val).toHaveProperty('entityId', 'hash:asIs')
      })
  })

  test('It should log trace calls when set to true', () => {
    const consoleTime = console.time
    const consoleTimeEnd = console.timeEnd
    console.time = jest.fn()
    console.timeEnd = jest.fn()
    return resolveEntity('hash:asIs', 'foo', {
      trace: true
    }).then(acc => {
      expect(console.time).toBeCalled()
      expect(console.timeEnd).toBeCalled()
      expect(acc).toHaveProperty('value', 'foo')
      console.time = consoleTime
      console.timeEnd = consoleTimeEnd
    })
  })

  test('It should resolve through bypass', () => {
    dataPoint.middleware.use('hash:before', (acc, next) => {
      acc.resolve('bar')
      next(null)
    })
    return resolveEntity('hash:asIs', 'foo').then(acc => {
      expect(acc).toHaveProperty('value', 'bar')
    })
  })

  test('It should resolve through bypass', () => {
    dataPoint.middleware.use('hash:before', (acc, next) => {
      const err = new Error('test')
      throw err
    })
    return resolveEntity('hash:asIs', 'foo')
      .catch(err => err)
      .then(err => {
        expect(err).toHaveProperty('message', 'test')
      })
  })
})

describe('ResolveEntity.resolve', () => {
  const resolve = resolver => (entityId, input, options) => {
    const racc = helpers.createAccumulator.call(null, input, options)
    const reducer = ReducerEntity.create(entityId)
    return ResolveEntity.resolve(
      dataPoint,
      Resolve.resolve,
      racc,
      reducer,
      resolver
    )
  }

  test('It should resolve as single entity', () => {
    const resolver = (acc, resolveTransform) => {
      const result = utils.set(acc, 'value', 'bar')
      return Promise.resolve(result)
    }
    return resolve(resolver)('hash:asIs', 'foo').then(acc => {
      expect(acc).toHaveProperty('value', 'bar')
    })
  })

  test('It should resolve as collection', () => {
    const resolver = (acc, resolveTransform) => {
      const result = utils.set(acc, 'value', 'bar')
      return Promise.resolve(result)
    }
    return resolve(resolver)('hash:asIs[]', ['foo']).then(acc => {
      expect(acc).toHaveProperty('value', ['bar'])
    })
  })
})
