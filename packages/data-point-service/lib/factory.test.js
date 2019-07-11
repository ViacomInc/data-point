/* eslint-env jest */

jest.mock('data-point-cache', () => {
  return {
    create () {
      return Promise.resolve('cache')
    }
  }
})

const os = require('os')
const Factory = require('./factory')
const DataPoint = require('data-point')
const _ = require('lodash')

describe('getDefaultSettings', () => {
  it('should return default settings', () => {
    expect(Factory.getDefaultSettings()).toMatchSnapshot()
  })
})

describe('prefixDeprecationError', () => {
  it('should do nothing if cache.prefix is undefined', () => {
    expect(() => {
      Factory.prefixDeprecationError({})
    }).not.toThrowError()
  })

  it('should warn when cache.prefix is set', () => {
    expect(() => {
      Factory.prefixDeprecationError({
        cache: {
          prefix: 'something'
        }
      })
    }).toThrowErrorMatchingSnapshot()
  })
})

describe('getCachePrefix', () => {
  const hostname = os.hostname
  const warn = console.warn
  afterEach(() => {
    os.hostname = hostname
    console.warn = warn
  })

  it('should return os.hostname if not set', () => {
    const options = {}
    os.hostname = () => 'test'
    expect(Factory.getCachePrefix(options)).toEqual('test:')
  })
  it('should use cache.redis.keyPrefix ', () => {
    const options = {
      cache: {
        redis: {
          keyPrefix: 'keyPrefix'
        }
      }
    }
    expect(Factory.getCachePrefix(options)).toEqual('keyPrefix:')
  })
  it('should use cache.redis.keyPrefix over cache.prefix ', () => {
    const options = {
      cache: {
        redis: {
          keyPrefix: 'keyPrefix'
        }
      }
    }
    console.warn = () => {}
    expect(Factory.getCachePrefix(options)).toEqual('keyPrefix:')
  })
  it('should use not add colon(:) twice', () => {
    const options = {
      cache: {
        redis: {
          keyPrefix: 'keyPrefix:'
        }
      }
    }
    console.warn = () => {}
    expect(Factory.getCachePrefix(options)).toEqual('keyPrefix:')
  })
})

describe('createServiceObject', () => {
  test('It should create a default ServiceObject', () => {
    const os = require('os')
    const Service = Factory.createServiceObject()
    expect(Service).toEqual({
      cache: null,
      dataPoint: null,
      isCacheAvailable: false,
      isCacheRequired: false,
      settings: {
        cache: {
          isRequired: false,
          redis: {
            keyPrefix: `${os.hostname()}:`
          }
        }
      }
    })
  })

  test('It should merge given options into default settings', () => {
    const os = require('os')
    const Service = Factory.createServiceObject({
      cache: {
        isRequired: true
      }
    })
    expect(Service).toEqual({
      cache: null,
      dataPoint: null,
      isCacheAvailable: false,
      isCacheRequired: true,
      settings: {
        cache: {
          isRequired: true,
          redis: {
            keyPrefix: `${os.hostname()}:`
          }
        }
      }
    })
  })
})

function saveRestoreLogs () {
  let loggerError
  let loggerWarn
  beforeEach(() => {
    loggerError = console.error
    loggerWarn = console.warn
    console.error = () => {}
    console.warn = () => {}
  })
  afterEach(() => {
    console.error = loggerError
    console.warn = loggerWarn
  })
}

describe('handleCacheError', () => {
  saveRestoreLogs()
  test('It should not throw error by default', () => {
    expect(
      Factory.handleCacheError(new Error(), {
        settings: {}
      })
    )
  })

  test('It should inform user', () => {
    console.error = jest.fn()
    console.warn = jest.fn()

    Factory.handleCacheError(new Error(), {
      settings: {}
    })

    expect(console.error).toBeCalled()
    expect(console.warn).toBeCalled()
  })

  test('It should throw error if cache is required', () => {
    expect(() => {
      Factory.handleCacheError(new Error('error'), {
        isCacheRequired: true,
        settings: {}
      })
    }).toThrowErrorMatchingSnapshot()
  })

  test('It should set isCacheAvailable as false if not error not thrown', () => {
    expect(
      Factory.handleCacheError(new Error(), {
        settings: {}
      })
    ).toHaveProperty('isCacheAvailable', false)
  })
})

describe('successCreateCache', () => {
  test('It should set flag and instance', () => {
    const result = Factory.successCreateCache(1, {})
    expect(result).toHaveProperty('isCacheAvailable', true)
    expect(result).toHaveProperty('cache', 1)
  })
})

describe('createCache', () => {
  test('It should create cache', () => {
    const service = {
      settings: {
        cache: {}
      }
    }
    return Factory.createCache(service)
      .catch(error => error)
      .then(result => {
        expect(result).toHaveProperty('isCacheAvailable', true)
        expect(result).toHaveProperty('cache', 'cache')
      })
  })
})

describe('successDataPoint', () => {
  test('It should set instance', () => {
    const result = Factory.successDataPoint(1, {})
    expect(result).toHaveProperty('dataPoint', 1)
  })
})

describe('bootstrapDataPoint', () => {
  saveRestoreLogs()
  test('It should exit if isCacheAvailable is false', () => {
    const bootstrap = jest.fn()
    Factory.bootstrapDataPoint(bootstrap, {})
    expect(bootstrap).not.toBeCalled()
  })
  test('It should set bootstrap if isCacheAvailable is true', () => {
    const bootstrap = jest.fn()
    const service = { isCacheAvailable: true }
    Factory.bootstrapDataPoint(bootstrap, { isCacheAvailable: true })
    expect(bootstrap).toBeCalledWith(service)
  })
})

describe('create', () => {
  saveRestoreLogs()
  test('It should create new DataPoint instance', () => {
    return Factory.create({
      DataPoint,
      cache: {
        isRequired: false
      },
      entities: {
        'reducer:foo': '$'
      }
    })
      .then(service => {
        expect(service.dataPoint).toHaveProperty('transform')
        return service
      })
      .then(service => {
        if (_.get(service, 'cache.redis.redis.disconnect')) {
          service.cache.redis.redis.disconnect()
        }
        return service
      })
  })
  test('It throw error if cache is required', () => {
    jest.resetModules()
    jest.mock('data-point-cache', () => {
      return {
        create: () => {
          return Promise.reject(new Error('FAILED'))
        }
      }
    })

    console.error = jest.fn()

    const Factory = require('./factory')

    return Factory.create({
      DataPoint,
      cache: {
        isRequired: true
      },
      entities: {
        'reducer:foo': '$'
      }
    })
      .then(service => {
        if (_.get(service, 'cache.redis.redis.disconnect')) {
          service.cache.redis.redis.disconnect()
        }
        return service
      })
      .catch(error => error)
      .then(res => {
        expect(console.error).toBeCalled()
        expect(res).toHaveProperty('message', 'FAILED')
      })
  })
})
