function set (cache, key, value, ttl) {
  cache.entries[key] = {
    value,
    ttl,
    created: Date.now()
  }
  return true
}

function get (cache, key) {
  const store = cache.entries[key] || {}
  return store.value
}

function del (cache, key) {
  delete cache.entries[key]
}

/**
 * NOTE: This method mutates the cache.entires array.
 * @param {Object} cache - Object that holds a reference to list of cache entries
 */
function swipeTick (cache) {
  const keys = Object.keys(cache.entries)
  if (keys.length > 10000) {
    cache.entries = {}
    console.warn(
      'Cache inMemory reached max (10000) number of entries, all keys now being deleted.'
    )
    return
  }

  const now = Date.now()
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index]
    const entry = cache.entries[key]
    if (now - entry.created > entry.ttl) {
      delete cache.entries[key]
    }
  }
}

function swipe (cache, interval = 1000) {
  clearInterval(cache.swipeTimerId)
  cache.swipeTimerId = setInterval(swipeTick, interval, cache)
  return cache.swipeTimerId
}

function bootstrap (cache) {
  cache.set = set.bind(null, cache)
  cache.get = get.bind(null, cache)
  cache.del = del.bind(null, cache)
  cache.swipe = swipe.bind(null, cache)
  cache.swipe()
  return cache
}

function create (options) {
  const Cache = {
    entries: {},
    set: null,
    get: null,
    del: null,
    swipe: null
  }
  return bootstrap(Cache)
}

module.exports = {
  set,
  get,
  del,
  swipeTick,
  swipe,
  create,
  bootstrap
}
