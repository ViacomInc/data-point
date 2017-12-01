const os = require('os')
const _ = require('lodash')
const Promise = require('bluebird')
const logger = require('./logger')

const DataPointFactory = require('./data-point-factory')
const { setupMiddleware } = require('./setup-middleware')

const Cache = require('data-point-cache')

const settingsDefault = {
  cache: {
    isRequired: false,
    prefix: os.hostname()
  }
}

function createServiceObject (options) {
  const settings = _.merge({}, settingsDefault, options)

  const cachePrefix = _.defaultTo(
    _.get(settings, 'cache.prefix'),
    os.hostname()
  )

  const isCacheRequired = _.defaultTo(_.get(settings, 'cache.isRequired'), true)

  return {
    isCacheRequired,
    cachePrefix,
    settings,
    isCacheAvaiable: false,
    cache: null,
    dataPoint: null
  }
}

function handleCacheError (err, Service) {
  logger.error('Could not connect to REDIS', Service.settings.cache)

  if (Service.isCacheRequired) {
    throw err
  } else {
    logger.warn(
      'REDIS is flagged as not required, this is NOT recommeded for production environments.'
    )
  }

  Service.isCacheAvaiable = false
  return Service
}

function successCreateCache (cache, service) {
  service.isCacheAvaiable = true
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
  if (!service.isCacheAvaiable) {
    logger.warn(
      'REDIS is not availabe, there will be no cacheing mechanism for',
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
      logger.error('DataPoint could not initialize')
      throw err
    })
}

module.exports = {
  create,
  createServiceObject,
  successCreateCache,
  createCache,
  handleCacheError,
  createDataPoint,
  successDataPoint,
  bootstrapDataPoint
}
