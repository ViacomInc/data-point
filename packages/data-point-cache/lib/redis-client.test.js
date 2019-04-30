/* eslint-env jest */

jest.mock('./io-redis')

const ms = require('ms')
const RedisClient = require('./redis-client')

describe('factory', () => {
  test('It should create a new redis instance', () => {
    return RedisClient.factory().then(redis => {
      expect(typeof redis.get === 'function').toBeTruthy()
      expect(typeof redis.set === 'function').toBeTruthy()
    })
  })
})

describe('reconnectOnError', () => {
  const consoleError = console.error
  afterAll(() => {
    console.error = consoleError
  })
  test('It should log error', () => {
    console.error = jest.fn()
    const result = RedisClient.reconnectOnError(new Error('test'))
    expect(console.error).toBeCalled()
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
      expect(typeof redisClient.del === 'function').toBeTruthy()
      expect(typeof redisClient.exists === 'function').toBeTruthy()
    })
  })
})

describe('get/set/exists', () => {
  test('It should test get/set/exists functionality', () => {
    return RedisClient.create().then(redisClient => {
      const redis = redisClient.redis
      return redisClient
        .set('test', 'test', 2000)
        .then(() => {
          const jobs = [
            redis
              .pipeline()
              .get('test')
              .exec(),
            redis
              .pipeline()
              .pttl('test')
              .exec(),
            redisClient.get('test'),
            redisClient.exists('test')
          ]
          return Promise.all(jobs)
        })
        .then(results => {
          const rawValue = results[0][0][1]
          const ttl = results[1][0][1]
          const value = results[2]
          const exists = results[3]

          expect(JSON.parse(rawValue)).toEqual({
            d: 'test'
          })
          expect(ttl).toBeGreaterThan(1900)
          expect(value).toEqual('test')
          expect(exists).toEqual(true)
        })
    })
  })

  test('It should test set with no ttl', () => {
    return RedisClient.create().then(redisClient => {
      const redis = redisClient.redis
      return redisClient
        .set('stale', 'test', 0)
        .then(() => {
          const jobs = [
            redis
              .pipeline()
              .get('stale')
              .exec(),
            redis
              .pipeline()
              .pttl('stale')
              .exec()
          ]
          return Promise.all(jobs)
        })
        .then(results => {
          const rawValue = results[0][0][1]
          const ttl = results[1][0][1]

          expect(JSON.parse(rawValue)).toEqual({
            d: 'test'
          })
          expect(ttl).toBe(-1)
        })
    })
  })

  test('It should set ttl to 2 weeks if not provided', () => {
    return RedisClient.create().then(redisClient => {
      const redis = redisClient.redis
      return redisClient
        .set('test', 'test')
        .then(() => {
          const jobs = [
            redis
              .pipeline()
              .get('test')
              .exec(),
            redis
              .pipeline()
              .pttl('test')
              .exec()
          ]
          return Promise.all(jobs)
        })
        .then(results => {
          const rawValue = results[0][0][1]
          const ttl = results[1][0][1]

          expect(JSON.parse(rawValue)).toEqual({
            d: 'test'
          })
          expect(ttl).toBeGreaterThan(ms('6d'))
        })
    })
  })

  test('It should test get on non existent key', () => {
    return RedisClient.create().then(redisClient => {
      return redisClient.get('invalid').then(value => {
        expect(value).toEqual(undefined)
      })
    })
  })

  test('It should test exists on non existent key', () => {
    return RedisClient.create().then(redisClient => {
      return redisClient.exists('invalid').then(value => {
        expect(value).toEqual(false)
      })
    })
  })

  test('It should delete a key', () => {
    return RedisClient.create().then(redisClient => {
      const redis = redisClient.redis

      return redis
        .pipeline()
        .set('toBeRemoved', 'foo')
        .exec()
        .then(() => {
          return redisClient.del('toBeRemoved')
        })
        .then(() => {
          return redis
            .pipeline()
            .get('toBeRemoved')
            .exec()
        })
        .then(result => {
          expect(result).toEqual([[null, null]])
        })
    })
  })
})

describe('redisDecorator', () => {
  const consoleError = console.error
  const consoleInfo = console.info
  afterAll(() => {
    console.error = consoleError
    console.info = consoleInfo
  })
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
    console.error = jest.fn()
    RedisClient.redisDecorator(redis, () => {})
    redis.emit('connect')
    redis.emit('error', new Error('test'))
    expect(console.error).toBeCalled()
  })

  test('It should log when reconnected', () => {
    const EventEmitter = require('events')
    const redis = new EventEmitter()
    console.info = jest.fn()

    RedisClient.redisDecorator(redis)
    redis.emit('reconnecting')
    redis.emit('connect')
    expect(console.info).toBeCalled()
  })
})
