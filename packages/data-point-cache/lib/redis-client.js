/* eslint-disable no-console */
const ms = require("ms");
const _ = require("lodash");
const { backOff } = require("exponential-backoff");
const EventEmitter = require("events");
const IORedis = require("./io-redis");

function reconnectOnError(err) {
  console.error("ioredis - reconnectOnError", err.toString());
  return true;
}

function redisDecorator(redis, options = {}, resolve, reject) {
  let wasConnected = false;

  redis.on("error", async error => {
    console.error("ioredis - error", error.toString());
    if (!wasConnected) {
      redis.disconnect();
      reject(error);

      if (options.backoff.enable) {
        await backOff(redis.connect, {
          numOfAttempts: 100,
          startingDelay: 1000,
          ...options.backoff.options
        });
        options.backoff.bus.emit("redis:backoff:reconnected");
      }
    }
  });

  redis.on("ready", () => {
    resolve(redis);
  });

  let reconnecting = false;
  redis.on("reconnecting", () => {
    reconnecting = true;
  });

  redis.on("connect", () => {
    wasConnected = true;
    if (reconnecting) {
      console.info("ioredis reconnected");
    }
  });
}

function factory(options) {
  return new Promise((resolve, reject) => {
    const opts = Object.assign({}, options, {
      reconnectOnError
    });
    const redis = new IORedis(opts);
    redisDecorator(redis, options, resolve, reject);
  });
}

function encode(value) {
  return JSON.stringify({ d: value });
}

function decode(value) {
  return value ? JSON.parse(value).d : undefined;
}

const week = ms("7d");

function set(cache, key, value, ttl = week) {
  const redis = cache.redis;
  const val = encode(value);
  const validTTL = typeof ttl === "number" && ttl > 0;

  const pipeline = redis.pipeline().set(key, val);

  if (validTTL) {
    pipeline.pexpire(key, ttl.toString());
  }

  return pipeline.exec();
}

function getFromRedisResult(res) {
  return res[0] ? decode(res[0][1]) : undefined;
}

async function get(cache, key) {
  const redis = cache.redis;
  const res = await redis
    .pipeline()
    .get(key)
    .exec();

  return getFromRedisResult(res);
}

async function exists(cache, key) {
  const redis = cache.redis;
  const res = await redis
    .pipeline()
    .exists(key)
    .exec();

  return res[0][1] === 1;
}

function del(cache, key) {
  const redis = cache.redis;
  return redis
    .pipeline()
    .del(key)
    .exec();
}

function bootstrap(cache) {
  /* eslint-disable no-param-reassign */
  cache.set = set.bind(null, cache);
  cache.get = get.bind(null, cache);
  cache.del = del.bind(null, cache);
  cache.exists = exists.bind(null, cache);
  /* eslint-enable no-param-reassign */
  return cache;
}

class RedisInstance {
  constructor(options = {}) {
    this.emitter = new EventEmitter();
    this.cache = {
      redis: null,
      set: null,
      get: null,
      del: null,
      exists: null,
      options
    };

    this.emitter.on("redis:backoff:reconnected", () => {
      _.set(this.cache, "options.backoff.enable", false);
      this.init();
    });
  }

  async init() {
    if (_.get(this.cache, "options.backoff.enable")) {
      this.cache.options.backoff.bus = this.emitter;
    }
    this.cache.redis = await factory(this.cache.options.redis);
    return bootstrap(this.cache);
  }
}

async function create(options = {}) {
  return new RedisInstance(options).init();
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
};
