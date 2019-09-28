const os = require("os");
const _ = require("lodash");
const Cache = require("data-point-cache");

const DataPointFactory = require("./data-point-factory");
const { setupMiddleware } = require("./setup-middleware");

/**
 * @returns {Object} Default module's options
 */
function getDefaultSettings() {
  return {
    cache: {
      isRequired: false
    }
  };
}

/**
 * @param {Object} options module's options
 * @returns {undefined}
 */
function prefixDeprecationError(options) {
  const prefix = _.get(options, "cache.prefix");
  if (typeof prefix !== "undefined") {
    throw new Error(
      "options.cache.prefix is now deprecated, please use options.cache.redis.keyPrefix instead."
    );
  }
}

/**
 * @param {Object} settings module's settings object
 * @returns {String} cache prefix defaults to os.hostname()
 */
function getCachePrefix(settings) {
  const keyPrefix = _.get(settings, "cache.redis.keyPrefix");
  const prefix = keyPrefix || os.hostname();
  const separator = prefix.endsWith(":") ? "" : ":";
  return `${prefix}${separator}`;
}

function createServiceObject(options) {
  prefixDeprecationError(options);

  const settings = _.merge({}, getDefaultSettings(), options);
  const isCacheRequired = _.defaultTo(
    _.get(settings, "cache.isRequired"),
    true
  );

  _.set(settings, "cache.redis.keyPrefix", getCachePrefix(settings));

  return {
    isCacheRequired,
    settings,
    isCacheAvailable: false,
    cache: null,
    dataPoint: null
  };
}

function handleCacheError(err, Service) {
  // eslint-disable-next-line no-console
  console.error("Could not connect to REDIS", Service.settings.cache);

  if (Service.isCacheRequired) {
    throw err;
  } else {
    // eslint-disable-next-line no-console
    console.warn(
      "REDIS is flagged as not required, this is NOT recommended for production environments."
    );
  }

  // eslint-disable-next-line no-param-reassign
  Service.isCacheAvailable = false;
  return Service;
}

function successCreateCache(cache, service) {
  /* eslint-disable no-param-reassign */
  service.isCacheAvailable = true;
  service.cache = cache;
  /* eslint-enable no-param-reassign */
  return service;
}

async function createCache(service) {
  let cacheService;

  try {
    const cache = await Cache.create(service.settings.cache);
    cacheService = successCreateCache(cache, service);
  } catch (error) {
    handleCacheError(error, service);
  }

  return cacheService;
}

function successDataPoint(dataPoint, service) {
  // eslint-disable-next-line no-param-reassign
  service.dataPoint = dataPoint;
  return service;
}

function bootstrapDataPoint(bootstrap, service) {
  if (!service.isCacheAvailable) {
    // eslint-disable-next-line no-console
    console.warn(
      "REDIS is not available, there will be no cache mechanism for",
      "DataPoint - we wish you the best of luck in your adventure."
    );
    return service;
  }

  return bootstrap(service);
}

async function createDataPoint(service) {
  const dataPoint = await DataPointFactory.create(service.settings);
  successDataPoint(dataPoint, service);
  return bootstrapDataPoint(setupMiddleware, service);
}

async function create(options) {
  let service;

  try {
    service = createServiceObject(options);
    await createCache(service); // mutates service object
    await createDataPoint(service); // mutates service object
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("DataPoint could not initialize");
    throw error;
  }

  return service;
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
};
