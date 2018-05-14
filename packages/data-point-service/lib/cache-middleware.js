const Promise = require('bluebird')
const defaultTo = require('lodash/defaultTo')
const set = require('lodash/fp/set')
const debug = require('debug')('data-point-service:cache')
const { deprecate } = require('util')
const ms = require('ms')

const SWR_CONTROL = 'SWR-CONTROL'

/**
 * @param {Function} cacheKey function to generate a cache key
 * @param {DataPoint.Accumulator} ctx DataPoint Accumulator object
 * @returns {String} generated cache key
 */
function generateKey (cacheKey, ctx) {
  return cacheKey ? cacheKey(ctx) : `entity:${ctx.context.id}`
}

/**
 * @param {String} key cache key
 * @returns {String} key postfixed with "swr.stale"
 */
function createSWRStaleKey (key) {
  return `${key}:swr.stale`
}

/**
 * @param {String} key cache key
 * @returns {String} key postfixed with "swr.control"
 */
function createSWRControlKey (key) {
  return `${key}:swr.control`
}

/**
 * @param {Service} service Service instance
 * @param {String} key entry key
 * @returns {Promise<Object|undefined>} entry value
 */
function getEntry (service, key) {
  return service.cache.get(key)
}

/**
 * @param {Service} service Service instance
 * @param {String} key entry key
 * @returns {Promise<Object|undefined>} entry value
 */
function getSWRStaleEntry (service, key) {
  return service.cache.get(createSWRStaleKey(key))
}

/**
 * @param {Service} service Service instance
 * @param {String} key entry key
 * @returns {Promise<Object|undefined>} entry value
 */
function getSWRControlEntry (service, key) {
  return getEntry(service, createSWRControlKey(key)).then(
    result => result === SWR_CONTROL
  )
}

/**
 * @param {Service} service Service instance
 * @param {String} key entry key
 * @param {Object} value entry value
 * @param {String} ttl time to live value supported by https://github.com/zeit/ms
 * @returns {Promise}
 */
function setEntry (service, key, value, ttl) {
  return service.cache.set(key, value, ttl)
}

/**
 * When stale is provided the value is calculated as ttl + stale
 * @param {Service} service Service instance
 * @param {String} key entry key
 * @param {Object} value entry value
 * @param {Number|String} ttl time to live value supported by https://github.com/zeit/ms
 * @returns {Promise}
 */
function setSWRStaleEntry (service, key, value, ttl) {
  return setEntry(service, createSWRStaleKey(key), value, ttl)
}

/**
 * @param {Service} service Service instance
 * @param {String} key entry key
 * @param {String} ttl time to live value supported by https://github.com/zeit/ms
 * @returns {Promise}
 */
function setSWRControlEntry (service, key, ttl) {
  return setEntry(service, createSWRControlKey(key), SWR_CONTROL, ttl)
}

/**
 * @param {Service} service Service instance
 * @param {String} entryKey entry key
 * @param {Object} value entry value
 * @param {Object} cache cache configuration
 * @returns {Promise}
 */
function setStaleWhileRevalidateEntry (service, entryKey, value, cache) {
  return setSWRStaleEntry(
    service,
    entryKey,
    value,
    cache.staleWhileRevalidateTtl
  ).then(() => setSWRControlEntry(service, entryKey, cache.ttl))
}

/**
 * @param {String} entityId entity Id
 * @param {String} entryKey entity cache key
 * @returns {Function<Boolean>} function that returns true
 */
function revalidateSuccess (entityId, entryKey) {
  return () => {
    debug(
      'Succesful revalidation entityId: %s with cache key: %s',
      entityId,
      entryKey
    )
    return true
  }
}

/**
 * @param {Service} service Service instance
 * @param {String} entryKey entity cache key
 * @param {Object} cache cache configuration
 * @returns {Function}
 */
function updateSWREntry (service, entryKey, cache) {
  /**
   * @param {Accumulator} acc
   */
  return acc => {
    return module.exports.setStaleWhileRevalidateEntry(
      service,
      entryKey,
      acc.value,
      cache
    )
  }
}

/**
 * @param {String} entityId entity Id
 * @param {String} entryKey entity cache key
 * @returns {Function}
 */
function handleRevalidateError (entityId, entryKey) {
  /**
   * @param {Error} error
   */
  return error => {
    console.error(
      'Could not revalidate entityId: %s with cache key: %s\n',
      entityId,
      entryKey,
      error
    )
    // there is really nothing to do here, on another iteration
    // params.staleWhileRevalidate could take an object that has a
    // custom error handler
    return false
  }
}

/**
 * @param {Service} service Service instance
 * @param {String} entryKey entry key
 * @param {Object} cache cache configuration
 * @param {DataPoint.Accumulator} ctx DataPoint Accumulator object
 * @returns {Promise}
 */
function revalidateEntry (service, entryKey, cache, ctx) {
  const entityId = ctx.context.id

  const revalidatingCache = {
    entityId,
    entryKey
  }

  // use this to bypass cache middleware
  const revalidateContext = set(
    'locals.revalidatingCache',
    revalidatingCache,
    ctx
  )
  debug('Revalidating entityId: %s with cache key: %s', entityId, entryKey)

  return service.dataPoint
    .resolveFromAccumulator(entityId, revalidateContext)
    .then(updateSWREntry(service, entryKey, cache))
    .then(revalidateSuccess(entityId, entryKey))
    .catch(handleRevalidateError(entityId, entryKey))
}

/**
 * Checks if the current entry key is the one being revalidated
 * @param {DataPoint.Accumulator} ctx DataPoint Accumulator object
 * @param {String} currentEntryKey entry key
 * @returns {Boolean} true if revalidating entryKey matches current key
 */
function isRevalidatingCacheKey (ctx, currentEntryKey) {
  const revalidatingCache = ctx.locals.revalidatingCache
  return (revalidatingCache && revalidatingCache.entryKey) === currentEntryKey
}

/**
 * If stale entry exists and control entry has expired it will fire a new thread
 * to resolve the entity, this thread is not meant to be chained to the main
 * Promise chain.
 *
 * @param {Service} service Service instance
 * @param {String} entryKey entry key
 * @param {Object} cache cache configuration
 * @param {DataPoint.Accumulator} ctx DataPoint Accumulator object
 * @returns {Promise<Object|undefined>} cached stale value
 */
function resolveStaleWhileRevalidateEntry (service, entryKey, cache, ctx) {
  // IMPORTANT: we only want to bypass an entity that is being revalidated and
  // that matches the same cache entry key, otherwise all child entities will
  // be needlesly resolved
  if (isRevalidatingCacheKey(ctx, entryKey)) {
    // bypass the rest forces entity to get resolved
    return undefined
  }

  const tasks = [
    getSWRControlEntry(service, entryKey),
    getSWRStaleEntry(service, entryKey)
  ]

  return Promise.all(tasks).then(results => {
    const controlEntry = results[0]
    const staleEntry = results[1]

    // we only want to revalidate if entry exprired but a stale response
    // already exists, otherwise means its a cold start and must be resolved
    // normally
    if (staleEntry && controlEntry === false) {
      // IMPORTANT: creates new thread
      // NOTE: using through module.exports allows us to test if it was called
      module.exports.revalidateEntry(service, entryKey, cache, ctx)
    }
    // return stale entry regardless
    return staleEntry
  })
}

const looseCacheParamsDeprecationWarning = deprecate(() => {},
'Usage of params.ttl, params.cacheKey and params.staleWhileRevalidate will be deprecated. Please configure through params.cache object instead')

/**
 * Logs deprecation warning if loose cache params were used
 * @param {Object} params entity's custom params
 */
function warnLooseParamsCacheDeprecation (params) {
  if (params.ttl || params.cacheKey || params.staleWhileRevalidate) {
    module.exports.looseCacheParamsDeprecationWarning()
  }
}

/**
 * @param {String|Number} value value in string ms format, or number milliseconds
 * @returns {Number}
 */
function parseMs (value) {
  return typeof value === 'string' ? ms(value) : value
}

/**
 * @param {String|Number|Boolean} staleWhileRevalidate if true will calculate twice the ttl
 * @param {String|Number} ttl
 * @returns {Number} in milliseconds
 */
function getStaleWhileRevalidateTtl (staleWhileRevalidate, ttl) {
  return staleWhileRevalidate === true
    ? parseMs(ttl) * 2 // default value
    : parseMs(ttl) + parseMs(staleWhileRevalidate)
}

/**
 * @param {String|Number|Boolean}  value
 * @returns {Bolean}
 */
function shouldUseStaleWhileRevalidate (value) {
  return (
    typeof value === 'string' || typeof value === 'number' || value === true
  )
}

/**
 * @param {Object} params entity's custom params
 * @returns {Object} normalized values
 */
function getCacheParams (params) {
  warnLooseParamsCacheDeprecation(params)
  const cache = defaultTo(params.cache, {})
  const ttl = defaultTo(cache.ttl, params.ttl)

  let useStaleWhileRevalidate
  let staleWhileRevalidateTtl

  // we only want to calculate below values if ttl is set
  if (typeof ttl !== 'undefined') {
    const staleWhileRevalidate = defaultTo(
      cache.staleWhileRevalidate,
      params.staleWhileRevalidate
    )

    useStaleWhileRevalidate = shouldUseStaleWhileRevalidate(
      staleWhileRevalidate
    )

    // only calculate stale's ttl if we need to
    if (useStaleWhileRevalidate) {
      staleWhileRevalidateTtl = getStaleWhileRevalidateTtl(
        staleWhileRevalidate,
        ttl
      )
    }
  }

  return {
    ttl,
    cacheKey: defaultTo(cache.cacheKey, params.cacheKey),
    useStaleWhileRevalidate,
    staleWhileRevalidateTtl
  }
}

/**
 * @param {Service} service Service instance
 * @param {DataPoint.Accumulator} ctx DataPoint Accumulator object
 * @param {Function} next Middleware callback
 */
function before (service, ctx, next) {
  const cache = getCacheParams(ctx.context.params)

  if (!cache.ttl || ctx.locals.resetCache === true) {
    return next()
  }

  const entryKey = generateKey(cache.cacheKey, ctx)

  Promise.resolve(cache.useStaleWhileRevalidate)
    .then(useStaleWhileRevalidate => {
      return useStaleWhileRevalidate
        ? module.exports.resolveStaleWhileRevalidateEntry(
            service,
            entryKey,
            cache,
            ctx
          )
        : getEntry(service, entryKey)
    })
    .then(value => {
      if (value !== undefined) {
        ctx.resolve(value)
      }
      return next()
    })
    .catch(next)
    .done()

  return true
}

/**
 * @param {Service} service Service instance
 * @param {DataPoint.Accumulator} ctx DataPoint Accumulator object
 * @param {Function} next Middleware callback
 */
function after (service, ctx, next) {
  const cache = getCacheParams(ctx.context.params)

  if (!cache.ttl) {
    // do nothing
    return next()
  }

  // from here below ttl is assumed to be true
  const entryKey = generateKey(cache.cacheKey, ctx)

  if (cache.useStaleWhileRevalidate) {
    // if its at the process of revalidating, then lets skip any further calls
    if (ctx.locals.revalidatingCache) {
      return next()
    }

    // adds (or updates) the stale cache entry with the latest value
    return module.exports
      .setStaleWhileRevalidateEntry(service, entryKey, ctx.value, cache)
      .then(() => {
        next()
      })
  }

  // adds a cache entry
  return setEntry(service, entryKey, ctx.value, cache.ttl).then(() => next())
}

module.exports = {
  generateKey,
  createSWRStaleKey,
  createSWRControlKey,
  getEntry,
  getSWRControlEntry,
  setEntry,
  setSWRStaleEntry,
  setSWRControlEntry,
  isRevalidatingCacheKey,
  resolveStaleWhileRevalidateEntry,
  revalidateEntry,
  setStaleWhileRevalidateEntry,
  looseCacheParamsDeprecationWarning,
  warnLooseParamsCacheDeprecation,
  parseMs,
  getStaleWhileRevalidateTtl,
  shouldUseStaleWhileRevalidate,
  getCacheParams,
  before,
  after
}
