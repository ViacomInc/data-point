const Promise = require('bluebird')
const set = require('lodash/fp/set')
const logger = require('./logger')

/**
 * @param {String} prefix cache ky prefix
 * @param {DataPoint.Accumulator} ctx DataPoint Accumulator object
 * @returns {String} generated cache key
 */
function generateKey (prefix, ctx) {
  const cacheKey = ctx.context.params.cacheKey
    ? ctx.context.params.cacheKey(ctx)
    : `entity:${ctx.context.id}`

  return `${prefix}:${cacheKey}`
}

/**
 * @param {String} key cache key
 * @returns {String} key prefixed with "SWI-STALE"
 */
function createSWIStaleKey (key) {
  return `SWI-STALE:${key}`
}

/**
 * @param {String} key cache key
 * @returns {String} key prefixed with "SWI-CONTROL"
 */
function createSWIControlKey (key) {
  return `SWI-CONTROL:${key}`
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
function getSWIStaleEntry (service, key) {
  return service.cache.get(createSWIStaleKey(key))
}

/**
 * @param {Service} service Service instance
 * @param {String} key entry key
 * @returns {Promise<Object|undefined>} entry value
 */
function getSWIControlEntry (service, key) {
  return getEntry(service, createSWIControlKey(key)).then(
    result => result === 'SWI-CONTROL'
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
 * @param {Service} service Service instance
 * @param {String} key entry key
 * @param {Object} value entry value
 * @param {String} ttl time to live value supported by https://github.com/zeit/ms
 * @returns {Promise}
 */
function setSWIStaleEntry (service, key, value, ttl) {
  return setEntry(service, createSWIStaleKey(key), value, 0)
}

/**
 * @param {Service} service Service instance
 * @param {String} key entry key
 * @param {String} ttl time to live value supported by https://github.com/zeit/ms
 * @returns {Promise}
 */
function setSWIControlEntry (service, key, ttl) {
  return setEntry(service, createSWIControlKey(key), 'SWI-CONTROL', ttl)
}

/**
 * @param {Service} service Service instance
 * @param {String} entryKey entry key
 * @param {Object} value entry value
 * @param {String} ttl time to live value supported by https://github.com/zeit/ms
 * @returns {Promise}
 */
function setStaleWhileRevalidateEntry (service, entryKey, value, ttl) {
  // NOTE: stale entries have NO ttl, rethink if this is the right approach or
  // if stale should just mean a much longer TTL?
  return setSWIStaleEntry(service, entryKey, value).then(() =>
    setSWIControlEntry(service, entryKey, ttl)
  )
}

/**
 * @param {String} entityId entity Id
 * @param {String} entryKey entity cache key
 * @returns {Function<Boolean>} function that returns true
 */
function revalidateSuccess (entityId, entryKey) {
  return () => {
    logger.debug(
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
 * @returns {Function}
 */
function updateSWIEntry (service, entryKey, ttl) {
  /**
   * @param {Accumulator} acc
   */
  return acc => {
    return setStaleWhileRevalidateEntry(service, entryKey, acc.value, ttl)
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
    logger.error(
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
 * @param {String} ttl time to live value supported by https://github.com/zeit/ms
 * @param {DataPoint.Accumulator} ctx DataPoint Accumulator object
 * @returns {Promise}
 */
function revalidateEntry (service, entryKey, ttl, ctx) {
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

  logger.debug(
    'Revalidating entityId: %s with cache key: %s',
    entityId,
    entryKey
  )

  return service.dataPoint
    .resolveFromAccumulator(entityId, revalidateContext)
    .then(updateSWIEntry(service, entryKey, ttl))
    .then(revalidateSuccess(entityId, entryKey))
    .catch(handleRevalidateError(entityId, entryKey))
}

/**
 * If stale entry exists and control entry has expired it will fire a new thread
 * to resolve the entity, this thread is not meant to be chained to the main
 * Promise chain.
 *
 * @param {Service} service Service instance
 * @param {String} entryKey entry key
 * @param {String} ttl time to live value supported by https://github.com/zeit/ms
 * @param {DataPoint.Accumulator} ctx DataPoint Accumulator object
 * @returns {Promise<Object|undefined>} cached stale value
 */
function resolveStaleWhileRevalidateEntry (service, entryKey, ttl, ctx) {
  const revalidatingCache = ctx.locals.revalidatingCache

  if (revalidatingCache) {
    // bypass the rest so entity gets resolved
    return undefined
  }

  const tasks = [
    getSWIControlEntry(service, entryKey),
    getSWIStaleEntry(service, entryKey)
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
      module.exports.revalidateEntry(service, entryKey, ttl, ctx)
    }
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
  const { ttl, staleWhileRevalidate } = ctx.context.params

  if (!ttl || ctx.locals.resetCache === true) {
    return next()
  }

  const entryKey = generateKey(service.cachePrefix, ctx)

  Promise.resolve(staleWhileRevalidate)
    .then(isStaleWhileRevalidate => {
      return isStaleWhileRevalidate
        ? module.exports.resolveStaleWhileRevalidateEntry(
            service,
            entryKey,
            ttl,
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
  const { ttl, staleWhileRevalidate } = ctx.context.params

  if (!ttl) {
    // do nothing
    return next()
  }

  // from here below ttl is assumed to be true
  const entryKey = generateKey(service.cachePrefix, ctx)

  if (staleWhileRevalidate) {
    // if its at the process of revalidating, then lets skip any further calls
    if (ctx.locals.revalidatingCache) {
      return next()
    }

    // adds (or updates) the stale cache entry with the latest value
    return module.exports
      .setStaleWhileRevalidateEntry(service, entryKey, ctx.value, ttl)
      .then(() => {
        next()
      })
  }

  // adds a cache entry
  return setEntry(service, entryKey, ctx.value, ttl).then(() => next())
}

module.exports = {
  generateKey,
  createSWIStaleKey,
  createSWIControlKey,
  getEntry,
  getSWIControlEntry,
  setEntry,
  setSWIStaleEntry,
  setSWIControlEntry,
  resolveStaleWhileRevalidateEntry,
  revalidateEntry,
  setStaleWhileRevalidateEntry,
  before,
  after
}
