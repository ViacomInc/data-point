const revalidationStoreFactory = require('./revalidation-store').create

const RedisController = require('./redis-controller')
const debug = require('debug')(
  'data-point-service:cache:stale-while-revalidate'
)

/**
 * Flag for redis control entry flag, when set it means the stored result should
 * be considered stale
 */
const SWR_CONTROL_STALE = 'SWR-CONTROL-STALE'

/**
 * Flag for redis control entry flag, when set it means the stored result should
 * be considered in revalidation state. Revalidation state is stored to prevent
 * duplication of concurrent revalidations by multiple node instances.
 */
const SWR_CONTROL_REVALIDATING = 'SWR-CONTROL-REVALIDATING'

/**
 * @param {Service} service Service instance
 * @returns {Object} External (redis) revalidation controller
 */
function revalidationExternalFactory (service) {
  return {
    add: (entryKey, ttl) => {
      debug(
        'Setting control to status: %s (%sms ttl) - %s',
        SWR_CONTROL_REVALIDATING,
        ttl,
        entryKey
      )
      return RedisController.setSWRControlEntry(
        service,
        entryKey,
        ttl,
        SWR_CONTROL_REVALIDATING
      )
    },
    remove: entryKey => {
      debug('Removing external Control - %s', entryKey)
      return RedisController.deleteSWRControlEntry(service, entryKey)
    },
    exists: entryKey => {
      return RedisController.getSWRControlEntry(service, entryKey).then(
        controlEntryValue => {
          const entryExists = typeof controlEntryValue !== 'undefined'
          debug('External control exists: %s - %s', entryExists, entryKey)
          return entryExists
        }
      )
    }
  }
}

/**
 * @param {Service} service Service instance
 * @param {String} entryKey entry key
 * @param {Object} value entry value
 * @param {Object} cache cache configuration
 * @returns {Promise}
 */
function addEntry (service, entryKey, value, cache) {
  debug('Adding entry - %s', entryKey)
  return RedisController.setSWRStaleEntry(
    service,
    entryKey,
    value,
    cache.staleWhileRevalidateTtl
  ).then(() => {
    debug('Setting control to status: %s - %s', SWR_CONTROL_STALE, entryKey)
    return RedisController.setSWRControlEntry(
      service,
      entryKey,
      cache.ttl,
      SWR_CONTROL_STALE
    )
  })
}

/**
 * @param {Service} service Service instance
 * @param {String} entryKey entry key
 * @returns {Promise}
 */
function getEntry (service, entryKey) {
  return RedisController.getSWRStaleEntry(service, entryKey)
}

/**
 * Adds revalidation flags locally (node instance) and external (redis) to
 * prevent duplicated revalidation of same key.
 * @param {Object} revalidation revalidation API
 * @param {String} entryKey cache entry key
 * @param {Number} revalidateTimeout time to timeout revalidation in milliseconds
 * @returns {Promise}
 */
function addRevalidationFlags (revalidation, entryKey, revalidateTimeout) {
  debug(
    'Add revalidation control flags - timeout: %sms - %s',
    revalidateTimeout,
    entryKey
  )
  // local (node instance) flag is set to immediately prevent concurrent calls
  revalidation.local.add(entryKey, revalidateTimeout)
  // external (redis) flag is set to prevent multiple instances from duplicating
  // revalidation efforts
  return revalidation.external.add(entryKey, revalidateTimeout)
}

/**
 * @param {Object} revalidation revalidation API
 * @param {String} entryKey cache entry key
 */
function clearAllRevalidationFlags (revalidation, entryKey) {
  debug('Clear revalidation control flags - %s', entryKey)
  revalidation.local.remove(entryKey)
  return revalidation.external.remove(entryKey)
}

/**
 * @typedef {Object} RevalidationState
 * @property {Boolean} hasExternalEntryExpired has external control expired
 * @property {Function} isRevalidatingLocally checks if key is being locally revalidated
 */
/**
 * Get local and external revalidation state
 * @param {Service} service cache service instance
 * @param {DataPoint.Accumulator} ctx DataPoint Accumulator object
 * @param {String} entryKey cache entry key
 * @returns {Promise<RevalidationState>} Object with revalidation state
 */
function getRevalidationState (revalidation, entryKey) {
  return revalidation.external.exists(entryKey).then(externalEntryExists => {
    const hasExternalEntryExpired = externalEntryExists === false
    return {
      hasExternalEntryExpired,
      isRevalidatingLocally: () => revalidation.local.exists(entryKey)
    }
  })
}

/**
 * @typedef {Object} RevalidationManager
 * @property {Object} local local cache controller
 * @property {Object} external external cache controller
 */
/**
 * @param {Service} service cache service instance
 * @returns {RevalidationManager}
 */
function createRevalidationManager (service) {
  return {
    local: revalidationStoreFactory(),
    external: revalidationExternalFactory(service)
  }
}

/**
 * @param {Service} service cache service instance
 * @returns {Object} Stale While Revalidate Controller
 */
function create (service) {
  const revalidation = createRevalidationManager(service)
  return {
    addEntry: addEntry.bind(null, service),
    getEntry: getEntry.bind(null, service),
    addRevalidationFlags: addRevalidationFlags.bind(null, revalidation),
    clearAllRevalidationFlags: clearAllRevalidationFlags.bind(
      null,
      revalidation
    ),
    invalidateLocalFlags: revalidation.local.clear,
    removeLocalRevalidationFlag: revalidation.local.remove,
    getRevalidationState: getRevalidationState.bind(null, revalidation)
  }
}

module.exports = {
  SWR_CONTROL_STALE,
  SWR_CONTROL_REVALIDATING,
  revalidationExternalFactory,
  addRevalidationFlags,
  clearAllRevalidationFlags,
  getRevalidationState,
  createRevalidationManager,
  addEntry,
  getEntry,
  create
}
