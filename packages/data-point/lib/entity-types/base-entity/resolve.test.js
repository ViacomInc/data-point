/* eslint-env jest */

const ResolveEntity = require('./resolve')
const createReducer = require('../../reducer-types').create
const resolveReducer = require('../../reducer-types').resolve
const createReducerEntity = require('../../reducer-types/reducer-entity').create

const FixtureStore = require('../../../test/utils/fixture-store')
const helpers = require('../../helpers')
const utils = require('../../utils')

let dataPoint

beforeAll(() => {
  dataPoint = FixtureStore.create()
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
          error: createReducer([])
        }
      }
    )
    return ResolveEntity.resolveErrorReducers(
      dataPoint,
      err,
      accumulator,
      resolveReducer
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
          error: createReducer((acc, next) => next(null, 'pass'))
        }
      }
    )
    return ResolveEntity.resolveErrorReducers(
      dataPoint,
      err,
      accumulator,
      resolveReducer
    ).then(acc => {
      expect(acc.value).toEqual('pass')
    })
  })
})

describe('ResolveEntity.createCurrentAccumulator', () => {
  let acc
  beforeAll(() => {
    const reducerEntity = createReducerEntity(createReducer, 'hash:base')
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

describe('ResolveEntity.resolveEntity', () => {
  const defaultResolver = (acc, resolveReducer) => Promise.resolve(acc)

  const resolveEntity = (entityId, input, options, resolver) => {
    const racc = helpers.createAccumulator.call(null, input, options)
    const reducer = createReducerEntity(createReducer, entityId)
    return ResolveEntity.resolveEntity(
      dataPoint,
      resolveReducer,
      racc,
      reducer,
      resolver || defaultResolver
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

  test('inputType - throws error if inputType does not pass', () => {
    return resolveEntity('model:c.0', 'foo')
      .catch(e => e)
      .then(e => {
        expect(e).toMatchSnapshot()
      })
  })

  test('inputType - if typeCheck passes then resolve normal', () => {
    return resolveEntity('model:c.0', 1).then(ac => {
      expect(ac.value).toEqual(1)
    })
  })

  test('outputType - throws error if outputType does not pass', () => {
    return resolveEntity('model:c.1', 1)
      .catch(e => e)
      .then(e => {
        expect(e).toMatchSnapshot()
      })
  })

  test('outputType - if typeCheck passes then resolve normal', () => {
    return resolveEntity('model:c.1', 'foo').then(ac => {
      expect(ac.value).toEqual('foo')
    })
  })

  test('typeCheck should not be able to change acc.value', () => {
    return resolveEntity('model:c.2', 'my string').then(result => {
      expect(result.value).toEqual('my string')
    })
  })

  test('if custom typeCheck throws then fail', () => {
    return resolveEntity('model:c.3', 123)
      .catch(e => e)
      .then(result => {
        expect(result).toBeInstanceOf(Error)
        expect(result).toMatchSnapshot()
      })
  })
})

describe('ResolveEntity.resolve', () => {
  const resolve = resolver => (entityId, input, options) => {
    const racc = helpers.createAccumulator.call(null, input, options)
    const reducer = createReducerEntity(createReducer, entityId)
    return ResolveEntity.resolve(
      dataPoint,
      resolveReducer,
      racc,
      reducer,
      resolver,
      []
    )
  }

  test('It should resolve as single entity', () => {
    const resolver = (acc, resolveReducer) => {
      const result = utils.set(acc, 'value', 'bar')
      return Promise.resolve(result)
    }
    return resolve(resolver)('hash:asIs', 'foo').then(acc => {
      expect(acc).toHaveProperty('value', 'bar')
    })
  })

  test('It should resolve as collection', () => {
    const resolver = (acc, resolveReducer) => {
      const result = utils.set(acc, 'value', 'bar')
      return Promise.resolve(result)
    }
    return resolve(resolver)('hash:asIs[]', ['foo']).then(acc => {
      expect(acc).toHaveProperty('value', ['bar'])
    })
  })
  test('It should return undefined if accumulator is not Array', () => {
    const resolver = (acc, resolveReducer) => {
      return Promise.resolve(acc)
    }
    return resolve(resolver)('hash:asIs[]', {}).then(acc => {
      expect(acc.value).toBeUndefined()
    })
  })
  test('It should not execute resolver if flag hasEmptyConditional is true and value is empty', () => {
    const resolver = jest.fn()
    return resolve(resolver)('?hash:asIs', undefined).then(acc => {
      expect(resolver).not.toHaveBeenCalled()
    })
  })

  test('It should execute resolver if flag hasEmptyConditional is true and value is not empty', () => {
    const resolver = (acc, resolveReducer) => {
      const result = utils.set(acc, 'value', 'bar')
      return Promise.resolve(result)
    }
    return resolve(resolver)('?hash:asIs', 'foo').then(acc => {
      expect(acc).toHaveProperty('value', 'bar')
    })
  })

  test('It should execute resolver only on non empty items of collection if hasEmptyConditional is set', () => {
    let count = 0
    const resolver = (acc, resolveReducer) => {
      const result = utils.set(acc, 'value', count++)
      return Promise.resolve(result)
    }
    return resolve(resolver)('?hash:asIs[]', [
      'a',
      undefined,
      'b',
      null,
      'c'
    ]).then(acc => {
      expect(acc).toHaveProperty('value', [0, undefined, 1, null, 2])
    })
  })
})
