const Promise = require('bluebird')
const set = require('lodash/fp/set')
const debug = require('debug')('data-point-service:cache')
const { getCacheParams } = require('./entity-cache-params')

const {
  setEntry,
  getEntry,
  setSWRStaleEntry,
  setSWRControlEntry,
  getSWRStaleEntry,
  getSWRControlEntry
} = require('./redis-controller')

/**
 * Flag for redis control entry flag, when set it means the stored result should
 * be considered stale
 */
const SWR_CONTROL_STALE = 'SWR-CONTROL-STALE'

/**
 * @param {Function} cacheKey function to generate a cache key
 * @param {DataPoint.Accumulator} ctx DataPoint Accumulator object
 * @returns {String} generated cache key
 */
function generateKey (cacheKey, ctx) {
  return cacheKey ? cacheKey(ctx) : `entity:${ctx.context.id}`
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
  ).then(() =>
    setSWRControlEntry(service, entryKey, cache.ttl, SWR_CONTROL_STALE)
  )
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
 * @param {*} staleEntry value of entry stored in cache stores
 * @param {RevalidationState} revalidationState cacheKey's revalidation state
 */
function shouldTriggerRevalidate (staleEntry, revalidationState) {
  // we only want to revalidate if:
  //  - stale response exists
  //  - external control entry has expired
  return staleEntry && typeof revalidationState === 'undefined'
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

  // this object serves as a flag is set to bypass cache middleware execution
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
 * When this function returns undefined it is telling the caller it should
 * make a standard resolution of the entity instead of using the
 * stale-while-revalidate process.
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
    const revalidationState = results[0]
    const staleEntry = results[1]

    if (shouldTriggerRevalidate(staleEntry, revalidationState)) {
      // IMPORTANT: revalidateEntry operates on a new thread
      // NOTE: using through module.exports allows us to test if it was called
      module.exports.revalidateEntry(service, entryKey, cache, ctx)
    } // Otherwise means its a cold start and must be resolved outside

    // return stale entry regardless
    return staleEntry
  })
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
  isRevalidatingCacheKey,
  resolveStaleWhileRevalidateEntry,
  revalidateEntry,
  setStaleWhileRevalidateEntry,
  before,
  after
}
