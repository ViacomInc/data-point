/* eslint-env jest */

const Promise = require('bluebird')

const ResolveEntity = require('./resolve')
const createReducer = require('../../reducer-types').create
const resolveReducer = require('../../reducer-types').resolve
const createReducerEntityId = require('../../reducer-types/reducer-entity-id')
  .create

const FixtureStore = require('../../../test/utils/fixture-store')
const helpers = require('../../helpers')
const utils = require('../../utils')

let dataPoint

const resolveEntity = (entityId, input, options, resolver) => {
  const racc = helpers.createAccumulator(input, options)
  const reducer = createReducerEntityId(createReducer, entityId)
  const entity = dataPoint.entities.get(entityId)
  return ResolveEntity.resolveEntity(
    dataPoint,
    resolveReducer,
    racc,
    reducer,
    entity
  )
}

beforeAll(() => {
  dataPoint = FixtureStore.create()
})

afterEach(() => {
  dataPoint.middleware.clear()
})

describe('ResolveEntity.resolveErrorReducers', () => {
  test('It should reject if no reducer is provided', () => {
    const err = new Error('Test')
    const accumulator = helpers.createAccumulator(
      {},
      {
        context: {
          error: null
        }
      }
    )
    return ResolveEntity.resolveErrorReducers(
      dataPoint,
      err,
      accumulator,
      resolveReducer
    )
      .catch(err => err)
      .then(result => {
        expect(result).toBeInstanceOf(Error)
        expect(result).toHaveProperty('message', 'Test')
      })
  })

  test('It should handle error if reducer is provided', () => {
    const err = new Error('Test')
    const accumulator = helpers.createAccumulator(
      {},
      {
        context: {
          error: createReducer((value, acc, next) => next(null, 'pass'))
        }
      }
    )
    return ResolveEntity.resolveErrorReducers(
      dataPoint,
      err,
      accumulator,
      resolveReducer
    ).then(result => {
      expect(result).toEqual('pass')
    })
  })
})

describe('getCurrentReducer', () => {
  it('should return reducer as is if type=ReducerEntity', () => {
    const reducer = {
      spec: 'spec'
    }
    expect(ResolveEntity.getCurrentReducer(reducer)).toEqual(reducer)
  })
  it('should return decorated reducer if type!=ReducerEntity', () => {
    const reducer = {}
    expect(ResolveEntity.getCurrentReducer(reducer, 'spec')).toEqual({
      spec: 'spec'
    })
  })
})
describe('ResolveEntity.createCurrentAccumulatorWithOverride', () => {
  let acc
  let spyGetUID
  let entity
  let reducer
  beforeEach(() => {
    spyGetUID = jest.spyOn(utils, 'getUID')
    spyGetUID.mockImplementationOnce(() => 10)
    reducer = createReducerEntityId(createReducer, 'hash:base')
    entity = dataPoint.entities.get('hash:base')
    const accumulator = helpers.createAccumulator({
      foo: 'bar'
    })
    accumulator.entityOverrides = {
      hash: {
        params: {
          inspect: true
        }
      }
    }
    acc = ResolveEntity.createCurrentAccumulator(accumulator, reducer, entity)
  })

  test('It should have entityOverrides', () => {
    expect(acc).toHaveProperty('params', { base: true, inspect: true })
  })
})

describe('ResolveEntity.createCurrentAccumulator', () => {
  let acc
  let spyGetUID
  let entity
  let reducer
  beforeEach(() => {
    spyGetUID = jest.spyOn(utils, 'getUID')
    spyGetUID.mockImplementationOnce(() => 10)
    reducer = createReducerEntityId(createReducer, 'hash:base')
    entity = dataPoint.entities.get('hash:base')
    const accumulator = helpers.createAccumulator({
      foo: 'bar'
    })
    acc = ResolveEntity.createCurrentAccumulator(accumulator, reducer, entity)
  })
  test('It should set reducer property', () => {
    expect(acc).toHaveProperty('reducer')
  })

  test('It should create and set uid property', () => {
    expect(spyGetUID).toBeCalled()
    expect(acc).toHaveProperty('uid', 'hash:base:10')
  })

  test('It should context as the current Entity', () => {
    expect(acc).toHaveProperty('context', entity)
  })
  test('It should initialValue acc.value', () => {
    expect(acc).toHaveProperty('initialValue', {
      foo: 'bar'
    })
  })
  test('It should set an initialValue for acc.params', () => {
    expect(acc).toHaveProperty('params', entity.params)
  })
  test('It should override debug method', () => {
    expect(acc.debug).toBeInstanceOf(Function)
  })
})

describe('ResolveEntity.resolveMiddleware', () => {
  test('It should execute a middleware', () => {
    dataPoint.middleware.use('request:before', (acc, next) => {
      acc.value = 'bar'
      next(null)
    })

    const acc = helpers.createAccumulator('foo')
    return ResolveEntity.resolveMiddleware(
      dataPoint,
      acc,
      'request:before'
    ).then(result => {
      expect(result).toEqual('bar')
    })
  })

  test('It should execute a middleware that forces an error to bypass the promise chain', () => {
    dataPoint.middleware.use('request:before', (acc, next) => {
      next(null, 'bar')
    })

    const acc = helpers.createAccumulator('foo')
    return ResolveEntity.resolveMiddleware(dataPoint, acc, 'request:before')
      .catch(reason => reason)
      .then(reason => {
        expect(reason).toBeInstanceOf(Error)
        expect(reason).toHaveProperty('name', 'bypass')
        expect(reason).toHaveProperty('bypass', true)
        expect(reason).toHaveProperty('bypassValue', 'bar')
      })
  })
})

describe('ResolveEntity.resolveEntity', () => {
  test('It should resolve entity', () => {
    return resolveEntity('model:asIs', 'foo').then(result => {
      expect(result).toBe('foo')
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
    return resolveEntity('model:traced', 'foo', {
      trace: true
    }).then(result => {
      expect(console.time).toBeCalled()
      expect(console.timeEnd).toBeCalled()
      expect(console.time.mock.calls).toMatchSnapshot()
      expect(console.timeEnd.mock.calls).toMatchSnapshot()
      expect(result).toEqual('foo')
      console.time = consoleTime
      console.timeEnd = consoleTimeEnd
    })
  })

  test('It should resolve through bypass', () => {
    dataPoint.middleware.use('hash:before', (acc, next) => {
      next(null, { data: 'bar' })
    })
    return resolveEntity('hash:asIs', 'foo').then(result => {
      expect(result).toEqual({ data: 'bar' })
    })
  })

  test('it should catch errors from middleware', () => {
    dataPoint.middleware.use('hash:before', (acc, next) => {
      throw new Error('test')
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
    return resolveEntity('model:c.0', 1).then(result => {
      expect(result).toEqual(1)
    })
  })
})

describe('ResolveEntity.resolveEntity outputType', () => {
  test('throws error if value does not pass typeCheck', () => {
    return resolveEntity('model:c.1', 1)
      .catch(e => e)
      .then(e => {
        expect(e).toMatchSnapshot()
      })
  })

  test('throws error if before method returns value that does not pass typeCheck', () => {
    return resolveEntity('model:c.5', 'some string')
      .catch(e => e)
      .then(e => {
        expect(e).toMatchSnapshot()
      })
  })

  test('throws error if middleware before returns value that does not pass typeCheck', () => {
    dataPoint.middleware.use('model:before', (acc, next) => {
      next(null, 1)
    })

    return resolveEntity('model:c.1', 'some string')
      .catch(e => e)
      .then(e => {
        expect(e).toMatchSnapshot()
      })
  })

  test('throws error if global before middleware returns value that does not pass typeCheck', () => {
    dataPoint.middleware.use('before', (acc, next) => {
      next(null, 1)
    })

    return resolveEntity('model:c.1', 'some string')
      .catch(e => e)
      .then(e => {
        expect(e).toMatchSnapshot()
      })
  })

  test('throws error if after method returns value that does not pass typeCheck', () => {
    return resolveEntity('model:c.4', 'some string')
      .catch(e => e)
      .then(e => {
        expect(e).toMatchSnapshot()
      })
  })

  test('throws error if after middleware returns value that does not pass typeCheck', () => {
    dataPoint.middleware.use('model:after', (acc, next) => {
      next(null, 1)
    })

    return resolveEntity('model:c.1', 'some string')
      .catch(e => e)
      .then(e => {
        expect(e).toMatchSnapshot()
      })
  })

  test('throws error if global after middleware returns value that does not pass typeCheck', () => {
    dataPoint.middleware.use('after', (acc, next) => {
      next(null, 1)
    })

    return resolveEntity('model:c.1', 'some string')
      .catch(e => e)
      .then(e => {
        expect(e).toMatchSnapshot()
      })
  })

  test('passes if error method returns value with correct type', () => {
    return resolveEntity('model:c.6', 'string').then(result => {
      expect(result).toBe('error string')
    })
  })

  test('throws if error method does not return value with correct type', () => {
    return resolveEntity('model:c.7', 'string')
      .catch(e => e)
      .then(e => {
        expect(e).toMatchSnapshot()
      })
  })

  test('is bypassed if error throws error', () => {
    return resolveEntity('model:c.8', 'string')
      .catch(e => e)
      .then(e => {
        expect(e).toMatchSnapshot()
      })
  })

  test('passes if error method catches typeCheck errors and returns value', () => {
    return resolveEntity('model:c.9', 'string').then(result => {
      expect(result).toBe('string from error')
    })
  })

  test('fails if error method catches typeCheck errors and returns bad value', () => {
    return resolveEntity('model:c.10', 'string')
      .catch(e => e)
      .then(e => {
        expect(e).toMatchSnapshot()
      })
  })

  test('resolves normally if typeCheck passes', () => {
    return resolveEntity('model:c.1', 'foo').then(result => {
      expect(result).toEqual('foo')
    })
  })

  test('does not change acc.value', () => {
    return resolveEntity('model:c.2', 'my string').then(result => {
      expect(result).toEqual('my string')
    })
  })

  test('throws error if custom typeCheck fails', () => {
    return resolveEntity('model:c.3', 123)
      .catch(e => e)
      .then(result => {
        expect(result).toBeInstanceOf(Error)
        expect(result).toMatchSnapshot()
      })
  })
})

describe('ResolveEntity.resolve', () => {
  const resolve = (entityId, input, options) => {
    const racc = helpers.createAccumulator(input, options)
    const reducer = createReducerEntityId(createReducer, entityId)
    const entity = dataPoint.entities.get(reducer.id)
    return ResolveEntity.resolve(
      dataPoint,
      resolveReducer,
      racc,
      reducer,
      entity
    )
  }

  test('It should resolve as single entity', () => {
    return resolve('model:asIs', 'foo').then(result => {
      expect(result).toEqual('foo')
    })
  })

  test('It should resolve as collection', () => {
    return resolve('model:asIs[]', ['foo']).then(result => {
      expect(result).toEqual(['foo'])
    })
  })
  test('It should return undefined if accumulator is not Array', () => {
    return resolve('model:asIs[]', {}).then(result => {
      expect(result).toBeUndefined()
    })
  })
  test('It should not execute resolver if flag hasEmptyConditional is true and value is empty', () => {
    return resolve('?model:asIs', undefined).then(result => {
      expect(result).toBeUndefined()
    })
  })

  test('It should execute resolver if flag hasEmptyConditional is true and value is not empty', () => {
    return resolve('?model:asIs', 'foo').then(result => {
      expect(result).toEqual('foo')
    })
  })

  test('It should execute resolver only on non empty items of collection if hasEmptyConditional is set', () => {
    return resolve('?model:asIs[]', ['a', undefined, 'b', null, 'c']).then(
      result => {
        expect(result).toEqual(['a', undefined, 'b', null, 'c'])
      }
    )
  })
})

describe('entity lifecycle methods', () => {
  // modifies the given stack by reference
  function addMiddleware (stack) {
    dataPoint.middleware.use('before', (acc, next) => {
      stack.push('before [middleware]')
      next(null)
    })
    dataPoint.middleware.use('model:before', (acc, next) => {
      stack.push('model:before [middleware]')
      next(null)
    })
    dataPoint.middleware.use('model:after', (acc, next) => {
      stack.push('model:after [middleware]')
      next(null)
    })
    dataPoint.middleware.use('after', (acc, next) => {
      stack.push('after [middleware]')
      next(null)
    })
  }

  function pushToStack (stack, value) {
    stack.push(value)
    return stack
  }

  test('It should resolve methods in the correct order with no error', () => {
    const stack = []

    addMiddleware(stack)

    return dataPoint
      .resolve('model:lifecycles', [], {
        locals: {
          before: () => pushToStack(stack, 'before'),
          value: () => pushToStack(stack, 'value'),
          after: () => pushToStack(stack, 'after'),
          error: () => pushToStack(stack, 'error')
        }
      })
      .catch(err => err)
      .then(output => {
        expect(output).toEqual([
          'before [middleware]',
          'model:before [middleware]',
          'before',
          'value',
          'after',
          'model:after [middleware]',
          'after [middleware]'
        ])
      })
  })
  test('It should resolve methods in the correct order when error is thrown', () => {
    const stack = []

    addMiddleware(stack)

    dataPoint.middleware.use('model:before', (acc, next) => {
      stack.push('model:before [middleware with error]')
      throw new Error()
    })

    return dataPoint
      .resolve('model:lifecycles', [], {
        locals: {
          before: () => pushToStack(stack, 'before'),
          value: () => pushToStack(stack, 'value'),
          after: () => pushToStack(stack, 'after'),
          error: () => pushToStack(stack, 'error')
        }
      })
      .catch(err => err)
      .then(output => {
        expect(output).toEqual([
          'before [middleware]',
          'model:before [middleware]',
          'model:before [middleware with error]',
          'error'
        ])
      })
  })
})
