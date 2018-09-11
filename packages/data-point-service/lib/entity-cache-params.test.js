/* eslint-env jest */

const EntityCacheParams = require('./entity-cache-params')

describe('warnLooseParamsCacheDeprecation', () => {
  const looseCacheParamsDeprecationWarning =
    EntityCacheParams.looseCacheParamsDeprecationWarning
  afterAll(() => {
    EntityCacheParams.looseCacheParamsDeprecationWarning = looseCacheParamsDeprecationWarning
  })
  it('should call deprecate if params.ttl is set', () => {
    EntityCacheParams.looseCacheParamsDeprecationWarning = jest.fn()
    expect(
      EntityCacheParams.warnLooseParamsCacheDeprecation({
        ttl: true
      })
    )
    expect(EntityCacheParams.looseCacheParamsDeprecationWarning).toBeCalled()
  })

  it('should call deprecate if params.cacheKey is set', () => {
    EntityCacheParams.looseCacheParamsDeprecationWarning = jest.fn()

    expect(
      EntityCacheParams.warnLooseParamsCacheDeprecation({
        cacheKey: true
      })
    )

    expect(EntityCacheParams.looseCacheParamsDeprecationWarning).toBeCalled()
  })

  it('should call deprecate if params.staleWhileRevalidate is set', () => {
    EntityCacheParams.looseCacheParamsDeprecationWarning = jest.fn()

    expect(
      EntityCacheParams.warnLooseParamsCacheDeprecation({
        staleWhileRevalidate: true
      })
    )

    expect(EntityCacheParams.looseCacheParamsDeprecationWarning).toBeCalled()
  })
})

describe('parseMs', () => {
  it('should return number if ms string is provided', () => {
    expect(EntityCacheParams.parseMs('1s')).toEqual(1000)
  })
  it('should return number if number is provided', () => {
    expect(EntityCacheParams.parseMs(1000)).toEqual(1000)
  })
})

describe('getStaleWhileRevalidateTtl', () => {
  it('should return double the value of ttl if staleWhileRevalidate is true', () => {
    expect(EntityCacheParams.getStaleWhileRevalidateTtl(true, 1000)).toEqual(
      2000
    )
  })
  it('should return addition of ttl and staleWhileRevalidate if staleWhileRevalidate different to true (string or number)', () => {
    expect(EntityCacheParams.getStaleWhileRevalidateTtl(500, 1000)).toEqual(
      1500
    )
    expect(EntityCacheParams.getStaleWhileRevalidateTtl('5s', 1000)).toEqual(
      6000
    )
  })
})

describe('shouldUseStaleWhileRevalidate', () => {
  it('should be true for "true", number and string', () => {
    expect(EntityCacheParams.shouldUseStaleWhileRevalidate(true)).toEqual(true)
    expect(EntityCacheParams.shouldUseStaleWhileRevalidate(200)).toEqual(true)
    expect(EntityCacheParams.shouldUseStaleWhileRevalidate('20m')).toEqual(true)
  })
  it('should be false for "false" and undefined', () => {
    expect(EntityCacheParams.shouldUseStaleWhileRevalidate(false)).toEqual(
      false
    )
    expect(EntityCacheParams.shouldUseStaleWhileRevalidate(undefined)).toEqual(
      false
    )
    expect(EntityCacheParams.shouldUseStaleWhileRevalidate(null)).toEqual(false)
  })
})

describe('getCacheParams', () => {
  it('should have backwards compatability with params loose properties', () => {
    const params = {
      ttl: '20s',
      cacheKey: () => true,
      staleWhileRevalidate: '10s'
    }
    const cache = EntityCacheParams.getCacheParams(params)
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
    const cache = EntityCacheParams.getCacheParams(params)
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
    const cache = EntityCacheParams.getCacheParams(params)
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
    const cache = EntityCacheParams.getCacheParams(params)
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
    const cache = EntityCacheParams.getCacheParams(params)
    expect(cache).toEqual({
      ttl: '20s',
      cacheKey: undefined,
      useStaleWhileRevalidate: false,
      staleWhileRevalidateTtl: undefined
    })
  })
})
