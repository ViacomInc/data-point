const ms = require("ms");

const RedisClient = require("./redis-client");
const InMemory = require("./in-memory");

const DefaultSettings = {
  localTTL: ms("2s")
};

/**
 * @param {String|Number} value
 * @returns {Number}
 */
function normalizeMilliseconds(value) {
  return typeof value === "string" ? ms(value) : value;
}

async function set(cache, key, value, ttl = "20m") {
  const ttlMs = normalizeMilliseconds(ttl);
  await cache.redis.set(key, value, ttlMs);
  return cache.local.set(key, value, cache.settings.localTTL);
}

/**
 * @param {Object} cache cache store
 * @param {String} key cache key
 * @returns {Promise<*>} undefined should be interpreted as not found
 */
async function getFromStore(cache, key) {
  const entry = await cache.local.get(key);

  // if we still have it stored locally return the value, skip everything else
  if (typeof entry !== "undefined") {
    return entry;
  }

  // if no longer in local memory, then get from redis
  const value = await cache.redis.get(key);

  // could be a race condition where by the time we get here the value
  // already was removed, so then skip local cache and move on
  if (typeof value === "undefined") {
    return undefined;
  }

  // update local cache (short ttl) for any consecutive calls
  cache.local.set(key, value, cache.settings.localTTL);

  return value;
}

async function get(cache, key) {
  const exists = await cache.redis.exists(key);
  if (exists) {
    return module.exports.getFromStore(cache, key);
  }
  return cache.local.del(key);
}

/**
 * @param {Object} cache cache object instance
 * @param {String} key cache key
 */
function del(cache, key) {
  return cache.redis.del(key);
}

/**
 * Decorates the cache object to add the API
 * @param {Object} cache object to be decorated
 */
function bootstrapAPI(cache) {
  /* eslint-disable no-param-reassign */
  cache.set = set.bind(null, cache);
  cache.get = get.bind(null, cache);
  cache.del = del.bind(null, cache);
  /* eslint-enable no-param-reassign */
  return cache;
}

async function create(options) {
  const settings = Object.assign({}, DefaultSettings, options);

  const cache = {
    settings,
    redis: null,
    local: null,
    set: null,
    get: null,
    del: null
  };

  const redis = await RedisClient.create(cache.settings);
  // eslint-disable-next-line no-param-reassign
  cache.redis = redis;
  // eslint-disable-next-line no-param-reassign
  cache.local = InMemory.create();

  return bootstrapAPI(cache);
}

module.exports = {
  normalizeMilliseconds,
  create,
  bootstrapAPI,
  getFromStore,
  set,
  get,
  del
};
