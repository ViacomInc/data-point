const ms = require("ms");
const Promise = require("bluebird");

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

function set(cache, key, value, ttl = "20m") {
  const ttlms = normalizeMilliseconds(ttl);
  return cache.redis
    .set(key, value, ttlms)
    .then(() => cache.local.set(key, value, cache.settings.localTTL));
}

/**
 * @param {Object} cache cache store
 * @param {String} key cache key
 * @returns {Promise<*>} undefined should be interpreted as not found
 */
function getFromStore(cache, key) {
  return Promise.resolve(cache.local.get(key)).then(entry => {
    // if we still have it stored locally return the value, skip everything else
    if (typeof entry !== "undefined") {
      return entry;
    }
    // if no longer in local memory, then get from redis
    return cache.redis.get(key).then(value => {
      // could be a race condition where by the time we get here the value
      // already was removed, so then skip local cache and move on
      if (typeof value === "undefined") {
        return undefined;
      }

      // update local cache (short ttl) for any consecutive calls
      cache.local.set(key, value, cache.settings.localTTL);

      return value;
    });
  });
}

function get(cache, key) {
  return cache.redis.exists(key).then(exists => {
    if (exists) {
      return module.exports.getFromStore(cache, key);
    }
    return cache.local.del(key);
  });
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

function create(options) {
  const settings = Object.assign({}, DefaultSettings, options);
  const Cache = {
    settings,
    redis: null,
    local: null,
    set: null,
    get: null,
    del: null
  };
  return Promise.resolve(Cache)
    .then(cache => {
      return RedisClient.create(cache.settings).then(redis => {
        // eslint-disable-next-line no-param-reassign
        cache.redis = redis;
        return cache;
      });
    })
    .then(cache => {
      // eslint-disable-next-line no-param-reassign
      cache.local = InMemory.create();
      return cache;
    })
    .then(bootstrapAPI);
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
