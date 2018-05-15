const os = require('os')
const _ = require('lodash')
const Promise = require('bluebird')

const DataPointFactory = require('./data-point-factory')
const { setupMiddleware } = require('./setup-middleware')

const Cache = require('data-point-cache')

/**
 * @returns {Object} Default module's options
 */
function getDefaultSettings () {
  return {
    cache: {
      isRequired: false
    }
  }
}

/**
 * @param {Object} options module's options
 * @returns {undefined}
 */
function prefixDeprecationError (options) {
  const prefix = _.get(options, 'cache.prefix')
  if (typeof prefix !== 'undefined') {
    throw new Error(
      'options.cache.prefix is now deprecated, please use options.cache.redis.keyPrefix instead.'
    )
  }
}

/**
 * @param {Object} settings module's settings object
 * @returns {String} cache prefix defaults to os.hostname()
 */
function getCachePrefix (settings) {
  const keyPrefix = _.get(settings, 'cache.redis.keyPrefix')
  const prefix = keyPrefix || os.hostname()
  const separator = prefix.endsWith(':') ? '' : ':'
  return `${prefix}${separator}`
}

function createServiceObject (options) {
  prefixDeprecationError(options)

  const settings = _.merge({}, getDefaultSettings(), options)
  const isCacheRequired = _.defaultTo(_.get(settings, 'cache.isRequired'), true)

  _.set(settings, 'cache.redis.keyPrefix', getCachePrefix(settings))

  return {
    isCacheRequired,
    settings,
    isCacheAvailable: false,
    cache: null,
    dataPoint: null
  }
}

function handleCacheError (err, Service) {
  console.error('Could not connect to REDIS', Service.settings.cache)

  if (Service.isCacheRequired) {
    throw err
  } else {
    console.warn(
      'REDIS is flagged as not required, this is NOT recommended for production environments.'
    )
  }

  Service.isCacheAvailable = false
  return Service
}

function successCreateCache (cache, service) {
  service.isCacheAvailable = true
  service.cache = cache
  return service
}

function createCache (service) {
  return Cache.create(service.settings.cache)
    .then(cache => successCreateCache(cache, service))
    .catch(err => handleCacheError(err, service))
}

function successDataPoint (dataPoint, service) {
  service.dataPoint = dataPoint
  return service
}

function createDataPoint (service) {
  return DataPointFactory.create(service.settings)
    .then(dataPoint => successDataPoint(dataPoint, service))
    .then(dataPoint => bootstrapDataPoint(setupMiddleware, service))
}

function bootstrapDataPoint (bootstrap, service) {
  if (!service.isCacheAvailable) {
    console.warn(
      'REDIS is not available, there will be no cacheing mechanism for',
      'DataPoint - we wish you the best of luck in your adventure.'
    )
    return service
  }

  return bootstrap(service)
}

function create (options) {
  const Service = createServiceObject(options)
  return Promise.resolve(true)
    .then(() => createCache(Service))
    .then(() => createDataPoint(Service))
    .catch(err => {
      console.error('DataPoint could not initialize')
      throw err
    })
}

module.exports = {
  getDefaultSettings,
  prefixDeprecationError,
  getCachePrefix,
  create,
  createServiceObject,
  successCreateCache,
  createCache,
  handleCacheError,
  createDataPoint,
  successDataPoint,
  bootstrapDataPoint
}
