/* eslint-disable no-console */
const ms = require("ms");
const IORedis = require("./io-redis");

function reconnectOnError(err) {
  console.error("ioredis - reconnectOnError", err.toString());
  return true;
}

function redisDecorator(redis, resolve, reject) {
  let wasConnected = false;
  redis.on("error", error => {
    console.error("ioredis - error", error.toString());
    if (!wasConnected) {
      redis.disconnect();
      reject(error);
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
    redisDecorator(redis, resolve, reject);
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

async function create(options = {}) {
  const cache = {
    redis: null,
    set: null,
    get: null,
    del: null,
    exists: null,
    options
  };

  const redis = await factory(cache.options.redis);
  // eslint-disable-next-line no-param-reassign
  cache.redis = redis;

  return bootstrap(cache);
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
