/* eslint-env jest */

const _ = require('lodash')
const nock = require('nock')
const Resolve = require('./resolve')

const AccumulatorFactory = require('../../accumulator/factory')
const ReducerFactory = require('../../reducer-types/factory')
const LocalsFactory = require('../../locals/factory')

const ResolveEntity = require('../base-entity/resolve')

const FixtureStore = require('../../../test/utils/fixture-store')

const helpers = require('../../helpers')

let dataPoint
let resolveReducerBound

function transform (entityId, value, options) {
  const reducer = dataPoint.entities.get(entityId)
  const accumulator = helpers.createAccumulator(value, {
    context: reducer,
    locals,
    values
  })
  const acc = Object.assign({}, accumulator, options)
  return Resolve.resolve(acc, resolveReducerBound)
}

let locals
let values

function helperMockContext (accumulatorData, reducerSource, requestName) {
  const accumulator = AccumulatorFactory.create({
    value: accumulatorData,
    locals,
    values
  })
  const reducer = ReducerFactory.create(reducerSource)
  return ResolveEntity.createCurrentAccumulator(dataPoint, accumulator, reducer)
}

beforeAll(() => {
  locals = LocalsFactory.create({
    itemPath: '/source1'
  })
  dataPoint = FixtureStore.create()
  resolveReducerBound = helpers.createReducerResolver(dataPoint)
  values = dataPoint.values.getStore()
})

beforeEach(() => {
  dataPoint.middleware.clear()
})

describe('resolveUrlInjections', () => {
  test('url with no reducer', () => {
    const value = {
      domain: 'foo.com'
    }

    const currentAccumulator = helperMockContext(
      value,
      'request:a1',
      'request:a1'
    )

    const result = Resolve.resolveUrlInjections(
      'http://{value.domain}/api',
      currentAccumulator
    )

    expect(result).toBe('http://foo.com/api')
  })
})

describe('resolveUrl', () => {
  test('It should set acc.url value', () => {
    const acc = Resolve.resolveUrl({
      reducer: {
        spec: {
          url: 'http://foo'
        }
      }
    })
    expect(acc).toHaveProperty('url', 'http://foo')
  })

  test('It should do injections', () => {
    const acc = Resolve.resolveUrl({
      value: 'bar',
      reducer: {
        spec: {
          url: 'http://foo/{value}'
        }
      }
    })
    expect(acc).toHaveProperty('url', 'http://foo/bar')
  })
})

describe('resolveOptions', () => {
  test('It should set acc.options', () => {
    const acc = _.set({}, 'reducer.spec', {
      options: ReducerFactory.create({
        port: () => 80
      })
    })

    return Resolve.resolveOptions(acc, resolveReducerBound).then(result => {
      expect(result.options).toEqual({
        method: 'GET',
        json: true,
        port: 80
      })
    })
  })

  test('It should set acc.options and override defaults', () => {
    const acc = {
      value: {
        method: 'POST',
        testProp: 1
      },
      reducer: {
        spec: {
          options: ReducerFactory.create({
            method: '$method',
            port: () => 80,
            qs: {
              testProp: '$testProp'
            }
          })
        }
      }
    }

    return Resolve.resolveOptions(acc, resolveReducerBound).then(result => {
      expect(result.options).toEqual({
        method: 'POST',
        json: true,
        port: 80,
        qs: {
          testProp: 1
        }
      })
    })
  })
})

describe('getRequestOptions', () => {
  test('set defaults', () => {
    expect(Resolve.getRequestOptions({})).toEqual({
      method: 'GET',
      json: true
    })

    expect(
      Resolve.getRequestOptions({
        json: false
      }).json
    ).toBe(false)

    expect(
      Resolve.getRequestOptions({
        timeout: 100
      })
    ).toEqual({
      method: 'GET',
      json: true,
      timeout: 100
    })
  })
})

describe('resolveRequest', () => {
  let consoleInfo
  beforeAll(() => {
    consoleInfo = console.info
  })
  afterEach(() => {
    console.info = consoleInfo
  })
  test('resolve reducer locals', () => {
    nock('http://remote.test')
      .get('/source1')
      .reply(200, {
        ok: true
      })

    const acc = {
      options: {
        json: true,
        url: 'http://remote.test/source1'
      }
    }

    return Resolve.resolveRequest(acc).then(result => {
      expect(result.value).toEqual({
        ok: true
      })
    })
  })

  test('log errors when request fails', () => {
    nock('http://remote.test')
      .get('/source1')
      .reply(404, 'not found')

    const acc = {
      options: {
        json: true,
        url: 'http://remote.test/source1'
      },
      value: 'foo'
    }
    _.set(acc, 'reducer.spec.id', 'test:test')
    console.info = jest.fn()
    return Resolve.resolveRequest(acc)
      .catch(e => e)
      .then(result => {
        expect(console.info).toBeCalled()
        expect(result.message).toMatchSnapshot()
      })
  })
})

describe('inspect', () => {
  let consoleInfo
  function getAcc () {
    const acc = {}
    _.set(acc, 'reducer.spec.id', 'test:test')
    _.set(acc, 'params.inspect', true)
    return acc
  }
  beforeAll(() => {
    consoleInfo = console.info
  })
  afterEach(() => {
    console.info = consoleInfo
  })
  test('It should not execute utils.inspect', () => {
    console.info = jest.fn()
    const acc = getAcc()
    acc.params.inspect = undefined
    Resolve.inspect(acc)
    expect(console.info).not.toBeCalled()
  })
  test('It should not execute utils.inspect', () => {
    console.info = jest.fn()
    Resolve.inspect(getAcc())
    expect(console.info.mock.calls[0]).toContain('test:test')
  })
  test('It should output options', () => {
    console.info = jest.fn()
    const acc = getAcc()
    _.set(acc, 'options', { options: 1 })
    Resolve.inspect(acc)
    expect(console.info.mock.calls[0]).toContain('\noptions:')
  })
})

describe('resolve', () => {
  test('simplest json call', () => {
    nock('http://remote.test')
      .get('/source1')
      .reply(200, {
        ok: true
      })

    return transform('request:a1', null).then(result => {
      expect(result.value).toEqual({
        ok: true
      })
    })
  })

  test('url injections', () => {
    nock('http://remote.test')
      .get('/source1')
      .reply(200, {
        ok: true
      })

    return transform('request:a1.0', {}).then(result => {
      expect(result.value).toEqual({
        ok: true
      })
    })
  })

  test('beforeRequest', () => {
    nock('http://remote.test')
      .get('/source1')
      .reply(200, {
        ok: true
      })

    return transform('request:a2', {}).then(result => {
      expect(result.value).toEqual({
        ok: true
      })
    })
  })

  test('use contextPath', () => {
    nock('http://remote.test')
      .get('/source1')
      .reply(200, {
        ok: true
      })

    return transform(
      'request:a3',
      {},
      {
        initialValue: {
          itemPath: '/source1'
        }
      }
    ).then(result => {
      expect(result.value).toEqual({
        ok: true
      })
    })
  })

  test('inject locals value with string template', () => {
    nock('http://remote.test')
      .get('/source1')
      .reply(200, {
        ok: true
      })

    return transform(
      'request:a3.2',
      {},
      {
        locals: {
          itemPath: '/source1'
        }
      }
    ).then(result => {
      expect(result.value).toEqual({
        ok: true
      })
    })
  })

  test('inject locals value with string template', () => {
    nock('http://remote.test')
      .get('/source1')
      .reply(200, {
        ok: true
      })

    return transform('request:a4', {}).then(result => {
      expect(result.value).toEqual({
        ok: true
      })
    })
  })
})
