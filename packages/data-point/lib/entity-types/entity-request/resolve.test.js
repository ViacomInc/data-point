/* eslint-env jest */

const _ = require('lodash')
const rp = require('request-promise')
const nock = require('nock')
let Resolve = require('./resolve')

const AccumulatorFactory = require('../../accumulator/factory')
const ReducerFactory = require('../../reducer-types/factory')

const ResolveEntity = require('../base-entity/resolve')

const FixtureStore = require('../../../test/utils/fixture-store')

const helpers = require('../../helpers')
let utils = require('../../utils')

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
  nock.cleanAll()
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
      expect(result).toEqual({
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

describe('inspect', () => {
  let utilsInspectSpy
  beforeEach(() => {
    // debugIdCounter is a local variable in
    // resolve.js, so this resets it to zero
    jest.resetModules()
    Resolve = require('./resolve')
    utils = require('../../utils')
    utilsInspectSpy = jest.spyOn(utils, 'inspect').mockReturnValue(undefined)
  })
  afterEach(() => {
    utilsInspectSpy.mockClear()
  })
  afterAll(() => {
    utilsInspectSpy.mockRestore()
  })

  function createAcc ({ inspect }) {
    return {
      value: 'boomerang',
      options: {},
      params: {
        inspect
      },
      reducer: _.set({}, 'spec.id', 'test:test')
    }
  }
  function createMockRequest (options) {
    const { statusCode, requestType, rpOptions } = options
    const nockInstance = nock('http://remote.test')
    nockInstance[requestType]('/').reply(statusCode, { statusCode })
    return rp[requestType]({
      uri: 'http://remote.test',
      resolveWithFullResponse: true,
      ...rpOptions
    })
  }

  test('It should ignore params.inspect and utils.inspect when params.inspect === undefined', async () => {
    const acc = createAcc({ inspect: undefined })
    const request = createMockRequest({ statusCode: 200, requestType: 'get' })
    await expect(request).resolves.toBeTruthy()
    Resolve.inspect(acc, request)
    expect(utilsInspectSpy).not.toBeCalled()
  })
  test('It should ignore params.inspect and utils.inspect when params.inspect === false', async () => {
    const acc = createAcc({ inspect: false })
    const request = createMockRequest({ statusCode: 200, requestType: 'get' })
    await expect(request).resolves.toBeTruthy()
    Resolve.inspect(acc, request)
    expect(utilsInspectSpy).not.toBeCalled()
  })
  test('It should execute utils.inspect when params.inspect === true', async () => {
    const acc = createAcc({ inspect: true })
    const request = createMockRequest({ statusCode: 200, requestType: 'get' })
    Resolve.inspect(acc, request)
    await expect(request).resolves.toBeTruthy()
    expect(utilsInspectSpy).toBeCalledWith(
      acc,
      expect.objectContaining({
        options: acc.options,
        value: acc.value
      })
    )
  })
  test('It should execute params.inspect when rp.then is called', async () => {
    const acc = createAcc({
      inspect: jest.fn(() => {
        // This helps verify that _.attempt is used when calling inspect
        throw new Error()
      })
    })
    const request = createMockRequest({
      statusCode: 200,
      requestType: 'get'
    })
    Resolve.inspect(acc, request)
    await expect(request).resolves.toBeTruthy()
    expect(utilsInspectSpy).not.toBeCalled()
    expect(acc.params.inspect.mock.calls).toEqual([
      [
        acc,
        expect.objectContaining({
          debugId: 1,
          type: 'request',
          method: 'GET',
          uri: expect.stringMatching('http://remote.test')
        })
      ],
      [
        acc,
        expect.objectContaining({
          debugId: 1,
          statusCode: 200,
          type: 'response'
        })
      ]
    ])
  })
  test('It should execute params.inspect when rp.catch is called', async () => {
    const acc = createAcc({
      inspect: jest.fn(() => {
        // This helps verify that _.attempt is used when calling inspect
        throw new Error()
      })
    })
    const request = createMockRequest({
      statusCode: 404,
      requestType: 'get'
    })
    Resolve.inspect(acc, request)
    await expect(request).rejects.toBeTruthy()
    expect(utilsInspectSpy).not.toBeCalled()
    expect(acc.params.inspect.mock.calls).toEqual([
      [
        acc,
        expect.objectContaining({
          debugId: 1,
          type: 'request',
          method: 'GET',
          uri: expect.stringMatching('http://remote.test')
        })
      ],
      [
        acc,
        expect.objectContaining({
          debugId: 1,
          statusCode: 404,
          type: 'error'
        })
      ]
    ])
  })
  test('It should pass the body option to params.inspect', async () => {
    const acc = createAcc({ inspect: jest.fn() })
    const bodyData = JSON.stringify({ test: true })
    const request = createMockRequest({
      statusCode: 200,
      requestType: 'post',
      rpOptions: {
        body: bodyData
      }
    })
    Resolve.inspect(acc, request)
    await expect(request).resolves.toBeTruthy()
    const mockArguments = acc.params.inspect.mock.calls.slice(0, 2)
    expect(utilsInspectSpy).not.toBeCalled()
    expect(mockArguments).toEqual([
      [
        acc,
        expect.objectContaining({
          debugId: 1,
          type: 'request',
          method: 'POST',
          uri: expect.stringMatching('http://remote.test'),
          body: expect.stringMatching(bodyData)
        })
      ],
      [
        acc,
        expect.objectContaining({
          debugId: 1,
          statusCode: 200,
          type: 'response'
        })
      ]
    ])
  })
  test('It should use incrementing debugId values', async () => {
    const executeRequest = async (resolveWithSuccess, expectedDebugId) => {
      const acc = createAcc({ inspect: jest.fn() })
      const request = createMockRequest({
        statusCode: resolveWithSuccess ? 200 : 404,
        requestType: 'get'
      })
      Resolve.inspect(acc, request)
      if (resolveWithSuccess) {
        await expect(request).resolves.toBeTruthy()
      } else {
        await expect(request).rejects.toBeTruthy()
      }
      expect(utilsInspectSpy).not.toBeCalled()
      expect(acc.params.inspect.mock.calls).toEqual([
        [
          acc,
          expect.objectContaining({
            debugId: expectedDebugId
          })
        ],
        [
          acc,
          expect.objectContaining({
            debugId: expectedDebugId
          })
        ]
      ])
    }
    await executeRequest(true, 1)
    await executeRequest(false, 2)
    await executeRequest(false, 3)
    await executeRequest(true, 4)
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
      expect(result).toEqual({
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
        expect(result).toEqual({
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
      expect(result).toEqual({
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
      expect(result).toEqual({
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
      expect(result).toEqual({
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
      expect(result).toEqual({
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
