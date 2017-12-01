/* eslint-env jest */

jest.mock('ioredis', () => {
  return require('ioredis-mock')
})

const RedisClient = require('./redis-client')

const logger = require('./logger')
logger.clear()

describe('factory', () => {
  test('It should create a new redis instance', () => {
    return RedisClient.factory().then(redis => {
      expect(typeof redis.get === 'function').toBeTruthy()
      expect(typeof redis.set === 'function').toBeTruthy()
    })
  })
})

describe('reconnectOnError', () => {
  test('It should log error', () => {
    logger.error = jest.fn()
    const result = RedisClient.reconnectOnError(new Error('test'))
    expect(logger.error).toBeCalled()
    expect(result).toEqual(true)
  })
})

describe('encode', () => {
  test('It should encode value', () => {
    const result = RedisClient.encode('test')
    expect(result).toEqual('{"d":"test"}')
  })
})

describe('decode', () => {
  test('It should decode value', () => {
    const result = RedisClient.decode('{"d":"test"}')
    expect(result).toEqual('test')
  })
  test('It should return undefined when value is undefined', () => {
    const result = RedisClient.decode()
    expect(result).toEqual(undefined)
  })
})

describe('getFromRedisResult', () => {
  test('It get value from ioredis result', () => {
    const res = [[[], ['{"d":"test"}']]]
    expect(RedisClient.getFromRedisResult(res)).toEqual('test')
  })
  test('It return undefined if res is not found', () => {
    const res = []
    expect(RedisClient.getFromRedisResult(res)).toEqual(undefined)
  })
})

describe('create', () => {
  test('It should create a new redis promisified instance', () => {
    return RedisClient.create().then(redisClient => {
      expect(typeof redisClient.redis.get === 'function').toBeTruthy()
      expect(typeof redisClient.redis.set === 'function').toBeTruthy()
      expect(typeof redisClient.get === 'function').toBeTruthy()
      expect(typeof redisClient.set === 'function').toBeTruthy()
      expect(typeof redisClient.exists === 'function').toBeTruthy()
    })
  })
})

describe('get/set/exists', () => {
  test('It should test get/set functionality', () => {
    return RedisClient.create().then(redisClient => {
      return redisClient
        .set('test', 'test')
        .then(() => {
          return redisClient.get('test')
        })
        .then(val => {
          expect(val).toEqual('test')
        })
        .then(() => {
          return redisClient.exists('test')
        })
        .then(val => {
          expect(val).toEqual(true)
        })
    })
  })
})

describe('redisDecorator', () => {
  test('It should execute resolve when ready', done => {
    const EventEmitter = require('events')
    const redis = new EventEmitter()
    const resolve = result => {
      expect(redis === result).toBeTruthy()
      done()
    }
    RedisClient.redisDecorator(redis, resolve, () => {})
    redis.emit('ready')
  })

  test('It should execute reject when error and not connected yet', done => {
    const EventEmitter = require('events')
    const redis = new EventEmitter()
    redis.disconnect = jest.fn()
    const reject = result => {
      expect(redis.disconnect).toBeCalled()
      done()
    }
    RedisClient.redisDecorator(redis, () => {}, reject)
    redis.emit('error', new Error('test'))
  })

  test('It should log error when already connected', () => {
    const EventEmitter = require('events')
    const redis = new EventEmitter()
    logger.error = jest.fn()
    RedisClient.redisDecorator(redis, () => {})
    redis.emit('connect')
    redis.emit('error', new Error('test'))
    expect(logger.error).toBeCalled()
  })

  test('It should log when reconnected', () => {
    const EventEmitter = require('events')
    const redis = new EventEmitter()
    logger.info = jest.fn()

    RedisClient.redisDecorator(redis)
    redis.emit('reconnecting')
    redis.emit('connect')
    expect(logger.info).toBeCalled()
  })
})
