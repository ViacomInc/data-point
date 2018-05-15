/* eslint-env jest */

const mockDebug = jest.fn()
jest.mock('debug', () => {
  return () => mockDebug
})

const util = require('util')
const ms = require('ms')
util.deprecate = jest.fn(fn => fn)

const CacheMiddleware = require('./cache-middleware')

function createContext () {
  const ctx = {
    locals: {},
    context: {
      params: {},
      id: 'model:Foo'
    },
    resolve: () => true
  }

  return ctx
}

function createMocks () {
  const resolveFromAccumulator = jest.fn(() => Promise.resolve('output'))
  const set = jest.fn(() => Promise.resolve(true))
  const get = jest.fn(() => Promise.resolve(true))
  const service = {
    dataPoint: {
      resolveFromAccumulator
    },
    cache: {
      set,
      get
    }
  }
  const ctx = createContext()
  return {
    resolveFromAccumulator,
    set,
    get,
    service,
    ctx
  }
}

describe('genrateKey', () => {
  it('should generate default id', () => {
    const ctx = createContext()
    const result = CacheMiddleware.generateKey(null, ctx)
    expect(result).toEqual('entity:model:Foo')
  })

  it('should generate a key using cacheKey parameter', () => {
    const ctx = createContext()

    const cacheKey = acc => {
      return `custom:${acc.context.id}`
    }

    const result = CacheMiddleware.generateKey(cacheKey, ctx)
    expect(result).toEqual('custom:model:Foo')
  })
})

describe('createSWRStaleKey', () => {
  it('should create stale key', () => {
    expect(CacheMiddleware.createSWRStaleKey('key')).toEqual('key:swr.stale')
  })
})

describe('createSWRStaleKey', () => {
  it('should create control key', () => {
    expect(CacheMiddleware.createSWRControlKey('key')).toEqual(
      'key:swr.control'
    )
  })
})

describe('getEntry', () => {
  it('should call cache.get from service to fetch a key', () => {
    const service = {
      cache: {
        get: key => Promise.resolve(`${key}:value`)
      }
    }
    return CacheMiddleware.getEntry(service, 'test').then(result => {
      expect(result).toEqual('test:value')
    })
  })
})

describe('getSWRControlEntry', () => {
  it('should return true if key exists with valid wrapper ', () => {
    const service = {
      cache: {
        get: jest.fn(key => Promise.resolve('SWR-CONTROL'))
      }
    }
    return CacheMiddleware.getSWRControlEntry(service, 'test').then(result => {
      expect(service.cache.get).toBeCalledWith('test:swr.control')
      expect(result).toEqual(true)
    })
  })

  it('should return true if key exists with valid wrapper ', () => {
    const service = {
      cache: {
        get: jest.fn(key => Promise.resolve(undefined))
      }
    }
    return CacheMiddleware.getSWRControlEntry(service, 'test').then(result => {
      expect(service.cache.get).toBeCalledWith('test:swr.control')
      expect(result).toEqual(false)
    })
  })
})

describe('setEntry', () => {
  it('should pass all arguments to cache.set', () => {
    const service = {
      cache: {
        set: jest.fn()
      }
    }
    CacheMiddleware.setEntry(service, 'key', 'value', 200)
    expect(service.cache.set).toBeCalledWith('key', 'value', 200)
  })
})

describe('setSWRStaleEntry', () => {
  it('should create a key that has no ttl', () => {
    const service = {
      cache: {
        set: jest.fn()
      }
    }
    CacheMiddleware.setSWRStaleEntry(service, 'key', 'value', 100)
    expect(service.cache.set).toBeCalledWith('key:swr.stale', 'value', 100)
  })
})

describe('setSWRControlEntry', () => {
  it('should create a key that has no ttl', () => {
    const service = {
      cache: {
        set: jest.fn()
      }
    }
    CacheMiddleware.setSWRControlEntry(service, 'key', 100)
    expect(service.cache.set).toBeCalledWith(
      'key:swr.control',
      'SWR-CONTROL',
      100
    )
  })
})

describe('setSWRControlEntry', () => {
  it('should create a key that has no ttl', () => {
    const service = {
      cache: {
        set: jest.fn()
      }
    }
    CacheMiddleware.setSWRControlEntry(service, 'key', 200)
    expect(service.cache.set).toBeCalledWith(
      'key:swr.control',
      'SWR-CONTROL',
      200
    )
  })
})

describe('setStaleWhileRevalidateEntry', () => {
  it('should store stale entry and SWR control entry', () => {
    const set = jest.fn(() => Promise.resolve(true))
    const service = {
      cache: {
        set
      }
    }

    const cache = {
      ttl: 200,
      staleWhileRevalidateTtl: 400
    }

    return CacheMiddleware.setStaleWhileRevalidateEntry(
      service,
      'key',
      'value',
      cache
    ).then(() => {
      expect(set.mock.calls[0]).toEqual(['key:swr.stale', 'value', 400])
      expect(set.mock.calls[1]).toEqual(['key:swr.control', 'SWR-CONTROL', 200])
    })
  })
})

describe('revalidateEntry', () => {
  let logError
  const cache = {
    ttl: 200,
    staleWhileRevalidateTtl: 400
  }

  beforeEach(() => {
    logError = console.error
    mockDebug.mockReset()
  })

  afterEach(() => {
    console.error = logError
  })

  it('should log at debug level start and success', () => {
    const mocks = createMocks()
    return CacheMiddleware.revalidateEntry(
      mocks.service,
      'key',
      cache,
      mocks.ctx
    ).then(() => {
      expect(mockDebug.mock.calls).toMatchSnapshot()
    })
  })

  it('should log error level when error occurs', () => {
    const mocks = createMocks()
    console.error = jest.fn()
    mocks.service.dataPoint.resolveFromAccumulator = () =>
      Promise.reject(new Error('TestError'))

    return CacheMiddleware.revalidateEntry(
      mocks.service,
      'key',
      cache,
      mocks.ctx
    ).then(() => {
      expect(console.error.mock.calls).toMatchSnapshot()
    })
  })

  it('should call dataPoint.resolveFromAccumulator with flagged context object', () => {
    const mocks = createMocks()
    return CacheMiddleware.revalidateEntry(
      mocks.service,
      'key',
      cache,
      mocks.ctx
    ).then(() => {
      // original context should not be mutated
      expect(mocks.ctx).not.toHaveProperty('locals.revalidatingCache')
      const resolveFromAccumulatorArgs =
        mocks.resolveFromAccumulator.mock.calls[0]
      expect(resolveFromAccumulatorArgs[0]).toEqual('model:Foo')
      expect(resolveFromAccumulatorArgs[1]).toHaveProperty(
        'locals.revalidatingCache',
        {
          entryKey: 'key',
          entityId: 'model:Foo'
        }
      )
    })
  })

  it('should set cache', () => {
    const mocks = createMocks()
    return CacheMiddleware.revalidateEntry(
      mocks.service,
      'key',
      cache,
      mocks.ctx
    ).then(() => {
      expect(mocks.resolveFromAccumulator).toBeCalled()
      expect(mocks.set.mock.calls).toMatchSnapshot()
    })
  })
})

describe('isRevalidatingCacheKey', () => {
  it('should return false if revalidating property does not exists', () => {
    const ctx = createContext()
    ctx.locals.revalidatingCache = undefined
    expect(CacheMiddleware.isRevalidatingCacheKey(ctx, 'key')).toEqual(false)
  })
  it('should return false if revalidating key does not match current key', () => {
    const ctx = createContext()
    ctx.locals.revalidatingCache = {
      entryKey: 'otherKey'
    }
    expect(CacheMiddleware.isRevalidatingCacheKey(ctx, 'key')).toEqual(false)
  })
  it('should return true if revalidating key matches current key', () => {
    const ctx = createContext()
    ctx.locals.revalidatingCache = {
      entryKey: 'key'
    }
    expect(CacheMiddleware.isRevalidatingCacheKey(ctx, 'key')).toEqual(true)
  })
})

describe('resolveStaleWhileRevalidateEntry', () => {
  let logDebug
  let logError
  const cache = {
    ttl: 200,
    staleWhileRevalidateTtl: 400
  }

  beforeEach(() => {
    logError = console.error
    // to hide when not testing it got called
    console.debug = () => true
  })
  afterEach(() => {
    console.debug = logDebug
    console.error = logError
  })

  it('should exit if revalidation flag is set', () => {
    const mocks = createMocks()
    mocks.ctx.locals.revalidatingCache = {
      entryKey: 'key'
    }
    const result = CacheMiddleware.resolveStaleWhileRevalidateEntry(
      mocks.service,
      'key',
      200,
      mocks.ctx
    )
    expect(result).toBeUndefined()
  })

  it('should return undefined if revalidation flag is set', () => {
    const mocks = createMocks()
    mocks.ctx.locals.revalidatingCache = {
      entryKey: 'key'
    }
    const result = CacheMiddleware.resolveStaleWhileRevalidateEntry(
      mocks.service,
      'key',
      cache,
      mocks.ctx
    )
    expect(result).toBeUndefined()
  })

  it('should return stale entry', () => {
    const mocks = createMocks()
    mocks.service.cache.get = jest.fn(key => {
      return Promise.resolve().then(() => {
        if (key === 'key:swr.stale') {
          return 'STALE'
        }
        // this forces getSWRControlEntry to return true
        if (key === 'key:swr.control') {
          return 'SWR-CONTROL'
        }
      })
    })
    const result = CacheMiddleware.resolveStaleWhileRevalidateEntry(
      mocks.service,
      'key',
      cache,
      mocks.ctx
    )
    return result.then(value => {
      expect(value).toEqual('STALE')
    })
  })

  it('should not call revalidateEntry if stale is not there', () => {
    const mocks = createMocks()
    const spyRevalidateEntry = jest.spyOn(CacheMiddleware, 'revalidateEntry')
    mocks.service.cache.get = jest.fn(key => {
      return Promise.resolve().then(() => {
        if (key === 'key:swr.stale') {
          return 'STALE'
        }
        // this forces getSWRControlEntry to return true, simulating that key's ttl
        // has not expired
        if (key === 'key:swr.control') {
          return 'SWR-CONTROL'
        }
      })
    })

    const result = CacheMiddleware.resolveStaleWhileRevalidateEntry(
      mocks.service,
      'key',
      cache,
      mocks.ctx
    )
    return result.then(value => {
      expect(spyRevalidateEntry).not.toBeCalled()
      expect(value).toEqual('STALE')
    })
  })

  it('should call revalidateEntry if stale is there and our control has expired', () => {
    const mocks = createMocks()
    const spyRevalidateEntry = jest.spyOn(CacheMiddleware, 'revalidateEntry')
    spyRevalidateEntry.mockImplementation(() => true)
    mocks.service.cache.get = jest.fn(key => {
      return Promise.resolve().then(() => {
        if (key === 'key:swr.stale') {
          return 'STALE'
        }
        // this forces getSWRControlEntry to return false, simulating that key's ttl
        // has now expired
        if (key === 'key:swr.control') {
          return undefined
        }
      })
    })
    const result = CacheMiddleware.resolveStaleWhileRevalidateEntry(
      mocks.service,
      'key',
      cache,
      mocks.ctx
    )
    return result.then(value => {
      expect(spyRevalidateEntry).toBeCalledWith(
        mocks.service,
        'key',
        cache,
        mocks.ctx
      )
      expect(value).toEqual('STALE')
      spyRevalidateEntry.mockReset()
      spyRevalidateEntry.mockRestore()
    })
  })
})

describe('warnLooseParamsCacheDeprecation', () => {
  const looseCacheParamsDeprecationWarning =
    CacheMiddleware.looseCacheParamsDeprecationWarning
  afterAll(() => {
    CacheMiddleware.looseCacheParamsDeprecationWarning = looseCacheParamsDeprecationWarning
  })
  it('should call deprecate if params.ttl is set', () => {
    CacheMiddleware.looseCacheParamsDeprecationWarning = jest.fn()
    expect(
      CacheMiddleware.warnLooseParamsCacheDeprecation({
        ttl: true
      })
    )
    expect(CacheMiddleware.looseCacheParamsDeprecationWarning).toBeCalled()
  })

  it('should call deprecate if params.cacheKey is set', () => {
    CacheMiddleware.looseCacheParamsDeprecationWarning = jest.fn()

    expect(
      CacheMiddleware.warnLooseParamsCacheDeprecation({
        cacheKey: true
      })
    )

    expect(CacheMiddleware.looseCacheParamsDeprecationWarning).toBeCalled()
  })

  it('should call deprecate if params.staleWhileRevalidate is set', () => {
    CacheMiddleware.looseCacheParamsDeprecationWarning = jest.fn()

    expect(
      CacheMiddleware.warnLooseParamsCacheDeprecation({
        staleWhileRevalidate: true
      })
    )

    expect(CacheMiddleware.looseCacheParamsDeprecationWarning).toBeCalled()
  })
})

describe('parseMs', () => {
  it('should return number if ms string is provided', () => {
    expect(CacheMiddleware.parseMs('1s')).toEqual(1000)
  })
  it('should return number if number is provided', () => {
    expect(CacheMiddleware.parseMs(1000)).toEqual(1000)
  })
})

describe('getStaleWhileRevalidateTtl', () => {
  it('should return double the value of ttl if staleWhileRevalidate is true', () => {
    expect(CacheMiddleware.getStaleWhileRevalidateTtl(true, 1000)).toEqual(2000)
  })
  it('should return addition of ttl and staleWhileRevalidate if staleWhileRevalidate different to true (string or number)', () => {
    expect(CacheMiddleware.getStaleWhileRevalidateTtl(500, 1000)).toEqual(1500)
    expect(CacheMiddleware.getStaleWhileRevalidateTtl('5s', 1000)).toEqual(6000)
  })
})

describe('shouldUseStaleWhileRevalidate', () => {
  it('should be true for "true", number and string', () => {
    expect(CacheMiddleware.shouldUseStaleWhileRevalidate(true)).toEqual(true)
    expect(CacheMiddleware.shouldUseStaleWhileRevalidate(200)).toEqual(true)
    expect(CacheMiddleware.shouldUseStaleWhileRevalidate('20m')).toEqual(true)
  })
  it('should be false for "false" and undefined', () => {
    expect(CacheMiddleware.shouldUseStaleWhileRevalidate(false)).toEqual(false)
    expect(CacheMiddleware.shouldUseStaleWhileRevalidate(undefined)).toEqual(
      false
    )
    expect(CacheMiddleware.shouldUseStaleWhileRevalidate(null)).toEqual(false)
  })
})

describe('getCacheParams', () => {
  it('should have backwards compatability with params loose properties', () => {
    const params = {
      ttl: '20s',
      cacheKey: () => true,
      staleWhileRevalidate: '10s'
    }
    const cache = CacheMiddleware.getCacheParams(params)
    expect(cache).toEqual({
      ttl: params.ttl,
      cacheKey: params.cacheKey,
      useStaleWhileRevalidate: true,
      staleWhileRevalidateTtl: 30000
    })
  })
  it('should get values from params.cache property', () => {
    const params = {
      cache: {
        ttl: '20s',
        cacheKey: () => true,
        staleWhileRevalidate: '10s'
      }
    }
    const cache = CacheMiddleware.getCacheParams(params)
    expect(cache).toEqual({
      ttl: params.cache.ttl,
      cacheKey: params.cache.cacheKey,
      useStaleWhileRevalidate: true,
      staleWhileRevalidateTtl: 30000
    })
  })
  it('should have params.cache priority over loose param cache settings', () => {
    const params = {
      ttl: '10s',
      cacheKey: () => true,
      staleWhileRevalidate: '20ms',
      cache: {
        ttl: '20s',
        cacheKey: () => true
      }
    }
    const cache = CacheMiddleware.getCacheParams(params)
    expect(cache).toEqual({
      ttl: params.cache.ttl,
      cacheKey: params.cache.cacheKey,
      // this key will use the loose value since its not being set through
      // params.cache
      useStaleWhileRevalidate: true,
      staleWhileRevalidateTtl: 20020
    })
  })
  it('should not calculate stale values if ttl is not set', () => {
    const params = {
      cache: {}
    }
    const cache = CacheMiddleware.getCacheParams(params)
    expect(cache).toEqual({
      ttl: undefined,
      cacheKey: undefined,
      useStaleWhileRevalidate: undefined,
      staleWhileRevalidateTtl: undefined
    })
  })
  it('should not calculate stale ttl if staleWhileRevalidate is not set', () => {
    const params = {
      cache: {
        ttl: '20s'
      }
    }
    const cache = CacheMiddleware.getCacheParams(params)
    expect(cache).toEqual({
      ttl: '20s',
      cacheKey: undefined,
      useStaleWhileRevalidate: false,
      staleWhileRevalidateTtl: undefined
    })
  })
})

describe('before', () => {
  it('should call next if no  ttl', () => {
    const mocks = createMocks()
    const next = jest.fn()
    CacheMiddleware.before(mocks.service, mocks.ctx, next)
    expect(next).toBeCalledWith() // with no arguments
  })

  it('should call next if ttl exists but resetCache is true', () => {
    const mocks = createMocks()
    const next = jest.fn()
    mocks.ctx.context.params.ttl = '20m'
    mocks.ctx.locals.resetCache = true
    CacheMiddleware.before(mocks.service, mocks.ctx, next)
    expect(next).toBeCalledWith() // with no arguments
  })

  it('should attempt to resolve staleWhileRevalidate if ttl exists and staleWhileRevalidate is set', done => {
    const mocks = createMocks()
    mocks.ctx.context.params.ttl = '20m'
    mocks.ctx.context.params.staleWhileRevalidate = '10m'

    const spyResolveStaleWhileRevalidateEntry = jest.spyOn(
      CacheMiddleware,
      'resolveStaleWhileRevalidateEntry'
    )
    spyResolveStaleWhileRevalidateEntry.mockImplementation(() => true)

    const cache = {
      ttl: '20m',
      cacheKey: undefined,
      useStaleWhileRevalidate: true,
      staleWhileRevalidateTtl: ms('20m') + ms('10m')
    }

    const next = () => {
      expect(spyResolveStaleWhileRevalidateEntry).toHaveBeenCalledWith(
        mocks.service,
        'entity:model:Foo',
        cache,
        mocks.ctx
      )
      done()
    }
    CacheMiddleware.before(mocks.service, mocks.ctx, next)
  })

  it('should resolve as normal cache key when staleWhileRevalidate is falsy', done => {
    const mocks = createMocks()
    mocks.ctx.context.params.ttl = '20m'
    mocks.ctx.context.params.staleWhileRevalidate = undefined
    mocks.service.cache.get = jest.fn()

    const next = jest.fn(() => {
      expect(mocks.service.cache.get).toHaveBeenCalledWith('entity:model:Foo')
      expect(next).toBeCalled()
      done()
    })

    CacheMiddleware.before(mocks.service, mocks.ctx, next)
  })

  it('should call ctx.resolve if value is not undefined', done => {
    const mocks = createMocks()
    mocks.ctx.context.params.ttl = '20m'
    mocks.ctx.resolve = jest.fn()
    mocks.ctx.context.params.staleWhileRevalidate = undefined
    mocks.service.cache.get = () => 'value'

    const next = jest.fn(() => {
      expect(mocks.ctx.resolve).toBeCalledWith('value')
      expect(next).toBeCalled()
      done()
    })

    CacheMiddleware.before(mocks.service, mocks.ctx, next)
  })
  it('should not call ctx.resolve if value is undefined', done => {
    const mocks = createMocks()
    mocks.ctx.context.params.ttl = '20m'
    mocks.ctx.resolve = jest.fn()
    mocks.ctx.context.params.staleWhileRevalidate = undefined
    mocks.service.cache.get = () => undefined

    const next = jest.fn(() => {
      expect(mocks.ctx.resolve).not.toBeCalled()
      expect(next).toBeCalled()
      done()
    })

    CacheMiddleware.before(mocks.service, mocks.ctx, next)
  })
})

describe('after', () => {
  it('should call next if no  ttl', () => {
    const mocks = createMocks()
    const next = jest.fn()
    CacheMiddleware.after(mocks.service, mocks.ctx, next)
    expect(next).toBeCalledWith() // with no arguments
  })

  it('should call not call setStaleWhileRevalidateEntry if ttl, staleWhileRevalidate and ctx.locals.revalidatingCache are true', () => {
    const mocks = createMocks()
    const next = jest.fn()

    mocks.ctx.context.params.ttl = '20m'
    mocks.ctx.context.params.staleWhileRevalidate = true
    mocks.ctx.locals.revalidatingCache = true
    const setStaleWhileRevalidateEntry = jest.spyOn(
      CacheMiddleware,
      'setStaleWhileRevalidateEntry'
    )

    CacheMiddleware.after(mocks.service, mocks.ctx, next)
    expect(setStaleWhileRevalidateEntry).not.toBeCalled()
    expect(next).toBeCalled()

    setStaleWhileRevalidateEntry.mockReset()
    setStaleWhileRevalidateEntry.mockRestore()
  })
  it('should call setStaleWhileRevalidateEntry if ttl, staleWhileRevalidate are true and ctx.locals.revalidatingCache is false', done => {
    const mocks = createMocks()

    mocks.ctx.value = 'VALUE'
    mocks.ctx.context.params.ttl = '20m'
    mocks.ctx.context.params.staleWhileRevalidate = '10m'
    mocks.ctx.locals.revalidatingCache = undefined
    const setStaleWhileRevalidateEntry = jest.spyOn(
      CacheMiddleware,
      'setStaleWhileRevalidateEntry'
    )
    setStaleWhileRevalidateEntry.mockImplementation(() => Promise.resolve())

    const cache = {
      ttl: '20m',
      cacheKey: undefined,
      useStaleWhileRevalidate: true,
      staleWhileRevalidateTtl: ms('20m') + ms('10m')
    }

    const next = () => {
      expect(setStaleWhileRevalidateEntry).toBeCalledWith(
        mocks.service,
        'entity:model:Foo',
        'VALUE',
        cache
      )
      setStaleWhileRevalidateEntry.mockReset()
      setStaleWhileRevalidateEntry.mockRestore()
      done()
    }

    CacheMiddleware.after(mocks.service, mocks.ctx, next)
  })

  it('should call not call setStaleWhileRevalidateEntry if ttl is true and staleWhileRevalidate is false, it should do a normal setEntry', done => {
    const mocks = createMocks()

    mocks.ctx.value = 'VALUE'
    mocks.ctx.context.params.ttl = '20m'
    mocks.ctx.context.params.staleWhileRevalidate = undefined
    mocks.ctx.locals.revalidatingCache = undefined
    const setStaleWhileRevalidateEntry = jest.spyOn(
      CacheMiddleware,
      'setStaleWhileRevalidateEntry'
    )
    mocks.service.cache.set = jest.fn(() => Promise.resolve())

    const next = () => {
      expect(setStaleWhileRevalidateEntry).not.toBeCalled()
      expect(mocks.service.cache.set).toBeCalledWith(
        'entity:model:Foo',
        'VALUE',
        '20m'
      )
      setStaleWhileRevalidateEntry.mockReset()
      setStaleWhileRevalidateEntry.mockRestore()
      done()
    }

    CacheMiddleware.after(mocks.service, mocks.ctx, next)
  })
})
