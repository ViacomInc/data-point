/* eslint-env jest */

const _ = require('lodash')
const SetupMiddleware = require('./setup-middleware')
const Promise = require('bluebird')

describe('generateKey', () => {
  test('It should generate key with prefix and cacheKey from method', () => {
    const ctx = {}
    _.set(ctx, 'context.params.cacheKey', () => 'key')
    expect(SetupMiddleware.generateKey('pre', ctx)).toEqual('pre:key')
  })

  test('It should generate key from context.id if no cacheKey passed', () => {
    const ctx = {}
    _.set(ctx, 'context.params.cacheKey', false)
    _.set(ctx, 'context.id', 'id')
    expect(SetupMiddleware.generateKey('pre', ctx)).toEqual('pre:entity:id')
  })
})

describe('before', () => {
  function mockCache (value) {
    return {
      cachePrefix: 'prefix',
      cache: {
        get: key => Promise.resolve(`${key}-${value}`)
      }
    }
  }

  test('It should call next if resetCache is true', () => {
    const ctx = {}
    _.set(ctx, 'locals.resetCache', true)
    const next = jest.fn()
    SetupMiddleware.before({}, ctx, next)
    expect(next).toBeCalled()
  })

  test('It should call next if there is no ttl | case where local.resetCache is false', () => {
    const ctx = {}
    _.set(ctx, 'locals.resetCache', false)
    _.set(ctx, 'context.params.ttl', null)
    const next = jest.fn()
    SetupMiddleware.before({}, ctx, next)
    expect(next).toBeCalled()
  })

  test('It should call ctx.resolve if cache gets value', done => {
    const ctx = {}
    _.set(ctx, 'locals.resetCache', false)
    _.set(ctx, 'context.params.ttl', '30')
    _.set(ctx, 'context.params.cacheKey', false)
    _.set(ctx, 'context.id', 'id')
    ctx.resolve = jest.fn()

    const next = () => {
      expect(ctx.resolve).toBeCalledWith('prefix:entity:id-value')
      done()
    }

    const service = mockCache('value')
    SetupMiddleware.before(service, ctx, next)
  })
})

describe('after', () => {
  function mockCache (setSpy) {
    return {
      cachePrefix: 'prefix',
      cache: {
        set: (...args) => {
          setSpy(...args)
          return Promise.resolve(true)
        }
      }
    }
  }

  test('SetupMiddleware is called and returns next if there is no ttl', done => {
    const ctx = {}
    _.set(ctx, 'context.params.ttl', null)

    const service = mockCache('value')
    service.cache.set = jest.fn()

    const next = () => {
      expect(service.cache.set).not.toBeCalled()
      done()
    }

    SetupMiddleware.after(service, ctx, next)
  })

  test('It should execute cache.set if ttl is present', done => {
    const ctx = {}
    _.set(ctx, 'context.params.ttl', '30')
    _.set(ctx, 'context.params.cacheKey', false)
    _.set(ctx, 'context.id', 'id')
    _.set(ctx, 'value', 'value')
    ctx.resolve = jest.fn()

    const spy = jest.fn()

    const next = () => {
      expect(spy).toBeCalledWith('prefix:entity:id', 'value', '30')
      done()
    }

    const service = mockCache(spy)
    SetupMiddleware.after(service, ctx, next)
  })
})

describe('setupMiddleware', () => {
  test('It should setup middleware', () => {
    const service = {
      dataPoint: require('data-point').create(),
      settings: {}
    }
    return SetupMiddleware.setupMiddleware(service)
      .catch(err => err)
      .then(s => {
        expect(s.dataPoint.middleware.store.size).toBe(2)

        const before = s.dataPoint.middleware.store.get('before')
        expect(before).toBeInstanceOf(Array)
        expect(before).toHaveLength(1)

        const after = s.dataPoint.middleware.store.get('after')
        expect(after).toBeInstanceOf(Array)
        expect(after).toHaveLength(1)
      })
  })

  test('It should use custom before/after if provided', () => {
    const service = {
      dataPoint: require('data-point').create(),
      settings: {
        before: 'before',
        after: 'after'
      }
    }
    return SetupMiddleware.setupMiddleware(service)
      .catch(err => err)
      .then(s => {
        expect(s.dataPoint.middleware.store.get('before')).toEqual(['before'])
        expect(s.dataPoint.middleware.store.get('after')).toEqual(['after'])
      })
  })
})
