const ms = require('ms')
const Promise = require('bluebird')
const IORedis = require('./io-redis')

function reconnectOnError (err) {
  console.error('ioredis - reconnectOnError', err.toString())
  return true
}

function redisDecorator (redis, resolve, reject) {
  let wasConnected = false
  redis.on('error', error => {
    if (!wasConnected) {
      redis.disconnect()
      return reject(error)
    }
    console.error('ioredis - error', error.toString())
  })

  redis.on('ready', () => {
    resolve(redis)
  })

  let reconnecting = false
  redis.on('reconnecting', () => {
    reconnecting = true
  })

  redis.on('connect', () => {
    wasConnected = true
    if (reconnecting) {
      console.info('ioredis reconnected')
    }
  })
}

function factory (options) {
  return new Promise((resolve, reject) => {
    const opts = Object.assign({}, options, {
      reconnectOnError
    })
    const redis = new IORedis(opts)
    redisDecorator(redis, resolve, reject)
  })
}

function create (options = {}) {
  const Cache = {
    redis: null,
    set: null,
    get: null,
    del: null,
    exists: null,
    options
  }
  return Promise.resolve(Cache)
    .then(cache => {
      return factory(cache.options.redis).then(redis => {
        cache.redis = redis
        return cache
      })
    })
    .then(bootstrap)
}

function bootstrap (cache) {
  cache.set = set.bind(null, cache)
  cache.get = get.bind(null, cache)
  cache.del = del.bind(null, cache)
  cache.exists = exists.bind(null, cache)
  return cache
}

function encode (value) {
  return JSON.stringify({ d: value })
}

function decode (value) {
  return value ? JSON.parse(value).d : undefined
}

const week = ms('7d')

function set (cache, key, value, ttl = week) {
  const redis = cache.redis
  const val = encode(value)
  const validTTL = typeof ttl === 'number' && ttl > 0

  const pipeline = redis.pipeline().set(key, val)

  if (validTTL) {
    pipeline.pexpire(key, ttl.toString())
  }

  return pipeline.exec()
}

function getFromRedisResult (res) {
  return res[0] ? decode(res[0][1]) : undefined
}

function get (cache, key) {
  const redis = cache.redis
  return redis
    .pipeline()
    .get(key)
    .exec()
    .then(getFromRedisResult)
}

function exists (cache, key) {
  const redis = cache.redis
  return redis
    .pipeline()
    .exists(key)
    .exec()
    .then(res => res[0][1] === 1)
}

function del (cache, key) {
  const redis = cache.redis
  return redis
    .pipeline()
    .del(key)
    .exec()
}

module.exports = {
  redisDecorator,
  getFromRedisResult,
  reconnectOnError,
  factory,
  create,
  bootstrap,
  set,
  get,
  del,
  exists,
  encode,
  decode
}
