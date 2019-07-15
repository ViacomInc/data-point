const defaultTo = require('lodash/defaultTo')
const { deprecate } = require('util')
const ms = require('ms')

const looseCacheParamsDeprecationWarning = deprecate(
  () => {},
  `Usage of params.ttl, params.cacheKey and params.staleWhileRevalidate will \
  be deprecated. Please configure through params.cache object instead`
)

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
  let revalidateTimeout

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

      // 5 seconds default
      revalidateTimeout = defaultTo(parseMs(cache.revalidateTimeout), 5000)
    }
  }

  return {
    ttl,
    cacheKey: defaultTo(cache.cacheKey, params.cacheKey),
    useStaleWhileRevalidate,
    staleWhileRevalidateTtl,
    revalidateTimeout
  }
}

module.exports = {
  looseCacheParamsDeprecationWarning,
  warnLooseParamsCacheDeprecation,
  parseMs,
  getStaleWhileRevalidateTtl,
  shouldUseStaleWhileRevalidate,
  getCacheParams
}
