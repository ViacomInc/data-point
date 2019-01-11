/* eslint-env jest */

const _ = require('lodash')
const nock = require('nock')
const requestDebug = require('request-debug')
const Resolve = require('./resolve')

const AccumulatorFactory = require('../../accumulator/factory')
const ReducerFactory = require('../../reducer-types/factory')

const ResolveEntity = require('../base-entity/resolve')

const FixtureStore = require('../../../test/utils/fixture-store')

const helpers = require('../../helpers')
const utils = require('../../utils')

jest.mock('request-debug')

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
  const entity = dataPoint.entities.get(reducer.id)
  return ResolveEntity.createCurrentAccumulator(accumulator, reducer, entity)
}

beforeAll(() => {
  locals = {
    itemPath: '/source1'
  }
  dataPoint = FixtureStore.create()
  resolveReducerBound = helpers.createReducerResolver(dataPoint)
  values = dataPoint.values.getStore()
})

beforeEach(() => {
  dataPoint.middleware.clear()
})

afterEach(() => {
  requestDebug.mockReset()
})

describe('getRequestPromiseWithDebugging', () => {
  test('call request-debug without a callback', () => {
    Resolve.getRequestPromiseWithDebugging(false)
    expect(requestDebug.mock.calls).toEqual([[expect.any(Function)]])
  })
  test('call request-debug with a callback', () => {
    const callback = jest.fn()
    Resolve.getRequestPromiseWithDebugging(callback)
    expect(requestDebug.mock.calls).toEqual([
      [expect.any(Function), expect.any(Function)]
    ])
    const callbackWrapper = requestDebug.mock.calls[0][1]
    const callbackArgs = ['TYPE', 'DATA', 'R']
    callbackWrapper(...callbackArgs)
    expect(callback).toHaveBeenCalledWith(...callbackArgs)
  })
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
  test('It should get spec.url', () => {
    const result = Resolve.resolveUrl({
      reducer: {
        spec: {
          url: 'http://foo'
        }
      }
    })
    expect(result).toBe('http://foo')
  })

  it('should fallback on acc.value when spec.url is not present', () => {
    const result = Resolve.resolveUrl({
      value: 'http://fallback.com',
      reducer: {
        spec: {
          url: undefined
        }
      }
    })
    expect(result).toBe('http://fallback.com')
  })

  it('should not fallback on acc.value if acc.value is empty', () => {
    const result = Resolve.resolveUrl({
      value: '',
      reducer: {
        spec: {
          url: undefined
        }
      }
    })
    expect(result).toBe(undefined)
  })

  it('should return undefined if Request.url is empty and acc.value empty but both are strings', () => {
    const result = Resolve.resolveUrl({
      value: '',
      reducer: {
        spec: {
          url: ''
        }
      }
    })
    expect(result).toBe(undefined)
  })

  it('should return undefined when neither spec.url is present or value is string', () => {
    const result = Resolve.resolveUrl({
      value: {}, // not a string
      reducer: {
        spec: {
          url: undefined
        }
      }
    })
    expect(result).toBe(undefined)
  })

  test('It should do injections', () => {
    const result = Resolve.resolveUrl({
      value: 'bar',
      reducer: {
        spec: {
          url: 'http://foo/{value}'
        }
      }
    })
    expect(result).toBe('http://foo/bar')
  })
})

describe('resolveOptions', () => {
  test('It should set acc.options', () => {
    const acc = {
      value: {
        subdomain: 'bar'
      },
      reducer: {
        spec: {
          url: 'http://foo.com/{value.subdomain}',
          options: ReducerFactory.create({
            port: () => 80
          })
        }
      }
    }

    return Resolve.resolveOptions(acc, resolveReducerBound).then(result => {
      expect(result.options).toEqual({
        method: 'GET',
        json: true,
        url: 'http://foo.com/bar',
        port: 80
      })
    })
  })

  test('It should set acc.options and override defaults', () => {
    const acc = {
      value: {
        method: 'POST',
        testProp: 1,
        subdomain: 'bar'
      },
      reducer: {
        spec: {
          url: 'http://foo.com/{value.subdomain}',
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
        url: 'http://foo.com/bar',
        qs: {
          testProp: 1
        }
      })
    })
  })
})

describe('getRequestOptions', () => {
  test('set defaults', () => {
    expect(Resolve.getRequestOptions('http://foo.com', {})).toEqual({
      method: 'GET',
      json: true,
      url: 'http://foo.com'
    })
    expect(
      Resolve.getRequestOptions('http://foo.com', {
        json: false
      })
    ).toEqual({
      method: 'GET',
      json: false,
      url: 'http://foo.com'
    })
    expect(
      Resolve.getRequestOptions('http://foo.com', { url: 'http://foo.com/bar' })
    ).toEqual({
      method: 'GET',
      json: true,
      url: 'http://foo.com/bar'
    })
    expect(
      Resolve.getRequestOptions('http://foo.com', {
        timeout: 100
      })
    ).toEqual({
      method: 'GET',
      json: true,
      timeout: 100,
      url: 'http://foo.com'
    })
    expect(
      Resolve.getRequestOptions('http://foo.com', { baseUrl: 'BASE_URL' })
    ).toEqual({
      method: 'GET',
      json: true,
      baseUrl: 'BASE_URL',
      uri: 'http://foo.com',
      url: ''
    })
    expect(
      Resolve.getRequestOptions('http://foo.com', {
        baseUrl: 'BASE_URL',
        uri: 'URI'
      })
    ).toEqual({
      method: 'GET',
      json: true,
      baseUrl: 'BASE_URL',
      uri: 'URI',
      url: ''
    })
  })
})

describe('resolveRequest', () => {
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
    return Resolve.resolveRequest(acc)
      .catch(e => e)
      .then(result => {
        expect(result.message).toMatchSnapshot()
      })
  })
})

describe('request-debug cleanup', () => {
  let _request
  beforeEach(() => {
    requestDebug.mockImplementationOnce((...args) => {
      _request = args[0]
      _request.stopDebugging = jest.fn()
    })
  })
  const initializeTest = statusCode => {
    nock('http://remote.test')
      .get('/source1')
      .reply(statusCode)
    const acc = {
      params: {
        requestDebug: true,
        inspect: jest.fn()
      },
      options: {
        json: true,
        url: 'http://remote.test/source1'
      }
    }
    return Resolve.resolveRequest(acc)
  }
  const makeAssertions = () => {
    expect(requestDebug).toHaveBeenCalledTimes(1)
    expect(_request.stopDebugging).toHaveBeenCalledTimes(1)
    delete _request.stopDebugging
  }

  test('call stopDebugging after request-promise resolves successfully', async () => {
    await expect(initializeTest(200)).resolves.not.toThrow()
    makeAssertions()
  })
  test('call stopDebugging after request-promise has an error', async () => {
    await expect(initializeTest(404)).rejects.toThrow()
    makeAssertions()
  })
})

describe('inspect', () => {
  let inspectSpy
  function getAcc () {
    const acc = {
      params: {},
      reducer: _.set({}, 'spec.id', 'test:test')
    }
    return acc
  }
  beforeAll(() => {
    inspectSpy = jest.spyOn(utils, 'inspect').mockReturnValue(undefined)
  })
  afterEach(() => {
    inspectSpy.mockClear()
  })
  afterAll(() => {
    inspectSpy.mockRestore()
  })
  test('It should not execute custom inspect or utils.inspect', () => {
    const acc = getAcc()
    acc.params.inspect = undefined

    Resolve.inspect(jest.fn(), acc)
    expect(inspectSpy).not.toBeCalled()
    expect(requestDebug).not.toHaveBeenCalled()
  })
  test('It should execute custom inspect when provided, not execute utils.inspect', () => {
    const acc = getAcc()
    acc.params.inspect = jest.fn()

    Resolve.inspect(jest.fn(), acc)
    expect(inspectSpy).not.toBeCalled()
    expect(acc.params.inspect).toBeCalledWith(acc)
    expect(requestDebug).not.toHaveBeenCalled()
  })
  test('It should execute utils.inspect when params.inspect === true', () => {
    const acc = getAcc()
    acc.params.inspect = true

    Resolve.inspect(jest.fn(), acc)
    expect(inspectSpy).toBeCalled()
    expect(requestDebug).not.toHaveBeenCalled()
  })
  test('It should use "request-debug" when inspect === true', () => {
    const acc = getAcc()
    acc.params.requestDebug = true
    acc.params.inspect = true

    Resolve.inspect(jest.fn(), acc)
    expect(inspectSpy).toBeCalled()
    expect(requestDebug.mock.calls).toEqual([[expect.any(Function)]])
  })
  test('It should use "request-debug" when inspect is a function', () => {
    const acc = getAcc()
    acc.params.requestDebug = true
    acc.params.inspect = jest.fn()

    Resolve.inspect(jest.fn(), acc)
    expect(inspectSpy).not.toBeCalled()
    expect(requestDebug.mock.calls).toEqual([
      [expect.any(Function), expect.any(Function)]
    ])
    const callback = acc.params.inspect
    const callbackWrapper = requestDebug.mock.calls[0][1]
    const callbackArgs = ['TYPE', 'DATA', 'R']
    callbackWrapper(...callbackArgs)
    expect(callback).toHaveBeenCalledWith(acc, ...callbackArgs)
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

  it('should use acc.value as url when request.url is not defined', () => {
    nock('http://remote.test')
      .get('/source1')
      .reply(200, {
        ok: true
      })

    return transform('request:a3', 'http://remote.test/source1').then(
      result => {
        expect(result.value).toEqual({
          ok: true
        })
      }
    )
  })

  test("interpolate data that's returned from the value lifecycle method", () => {
    nock('http://remote.test')
      .get('/source5')
      .reply(200, {
        ok: true
      })

    return transform('request:a1.4', {
      source: 'source5'
    }).then(result => {
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

  test('it should inject locals value with string template', () => {
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

  test('it should use options.baseURL to create a request URL', () => {
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

  test('it should omit options.auth when encountering an error', () => {
    nock('http://remote.test')
      .get('/source1')
      .reply(404)

    return transform('request:a9', {}).catch(err => {
      expect(err.statusCode).toEqual(404)
      expect(err.message).toMatchSnapshot()

      // credentials are still available in the raw error.options
      expect(err.options.auth).toEqual({
        user: 'cool_user',
        pass: 'super_secret!'
      })
    })
  })
})
