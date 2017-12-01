/* eslint-env jest */

jest.mock('data-point-cache', () => {
  return {
    create () {
      return Promise.resolve('cache')
    }
  }
})

let Factory = require('./factory')
const DataPoint = require('data-point')
const _ = require('lodash')

const logger = require('./logger')

logger.clear()

describe('createServiceObject', () => {
  test('It should create a default ServiceObject', () => {
    const os = require('os')
    const Service = Factory.createServiceObject()
    expect(Service).toEqual({
      cache: null,
      cachePrefix: os.hostname(),
      dataPoint: null,
      isCacheAvaiable: false,
      isCacheRequired: false,
      settings: {
        cache: {
          isRequired: false,
          prefix: os.hostname()
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
      cachePrefix: os.hostname(),
      dataPoint: null,
      isCacheAvaiable: false,
      isCacheRequired: true,
      settings: {
        cache: {
          isRequired: true,
          prefix: os.hostname()
        }
      }
    })
  })
})

function saveRestoreLogs () {
  let loggerError
  let loggerWarn
  beforeEach(() => {
    loggerError = logger.error
    loggerWarn = logger.warn
    logger.error = () => {}
    logger.warn = () => {}
  })
  afterEach(() => {
    logger.error = loggerError
    logger.warn = loggerWarn
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
    logger.error = jest.fn()
    logger.warn = jest.fn()

    Factory.handleCacheError(new Error(), {
      settings: {}
    })

    expect(logger.error).toBeCalled()
    expect(logger.warn).toBeCalled()
  })

  test('It should throw error if cache is required', () => {
    expect(() => {
      Factory.handleCacheError(new Error('error'), {
        isCacheRequired: true,
        settings: {}
      })
    }).toThrowError('error')
  })

  test('It should set isCacheAvaiable as false if not error not thrown', () => {
    expect(
      Factory.handleCacheError(new Error(), {
        settings: {}
      })
    ).toHaveProperty('isCacheAvaiable', false)
  })
})

describe('successCreateCache', () => {
  test('It should set flag and instance', () => {
    const result = Factory.successCreateCache(1, {})
    expect(result).toHaveProperty('isCacheAvaiable', true)
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
        expect(result).toHaveProperty('isCacheAvaiable', true)
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
  test('It should exit if isCacheAvaiable is false', () => {
    const boostrapp = jest.fn()
    Factory.bootstrapDataPoint(boostrapp, {})
    expect(boostrapp).not.toBeCalled()
  })
  test('It should set bootstrap if isCacheAvaiable is true', () => {
    const boostrapp = jest.fn()
    const service = { isCacheAvaiable: true }
    Factory.bootstrapDataPoint(boostrapp, { isCacheAvaiable: true })
    expect(boostrapp).toBeCalledWith(service)
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
        'transform:foo': '$.'
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

    const mockLogError = jest.fn()
    jest.mock('./logger', () => {
      return {
        error: mockLogError
      }
    })

    Factory = require('./factory')

    return Factory.create({
      DataPoint,
      cache: {
        isRequired: true
      },
      entities: {
        'transform:foo': '$.'
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
        expect(mockLogError).toBeCalled()
        expect(res).toHaveProperty('message', 'FAILED')
      })
  })
})
