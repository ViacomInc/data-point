const _ = require('lodash')
const Promise = require('bluebird')
const rp = require('request-promise')

const createReducer = require('../../reducer-types').create
const utils = require('../../utils')

/**
 * request's default options
 * @type {Object}
 */
const REQUEST_DEFAULT_OPTIONS = {
  method: 'GET',
  json: true
}

/**
 * @param {string} url
 * @param {Object} specOptions
 * @return {Object}
 */
function getRequestOptions (url, specOptions) {
  const options = _.defaults({}, specOptions, REQUEST_DEFAULT_OPTIONS)
  // this makes it possible to modify
  // the url in the options reducer
  options.url = options.url || url
  if (options.baseUrl) {
    options.uri = options.uri || options.url
    options.url = ''
  }

  return options
}

module.exports.getRequestOptions = getRequestOptions

/**
 * Resolve options object
 * @param {Accumulator} accumulator
 * @param {Function} resolveReducer
 * @return {Promise<Accumulator>}
 */
function resolveOptions (accumulator, resolveReducer) {
  accumulator = resolveUrl(accumulator)
  const specOptions = accumulator.reducer.spec.options
  return resolveReducer(accumulator, specOptions, 'options').then(acc => {
    const options = getRequestOptions(acc.url, acc.value)
    return utils.assign(accumulator, { options })
  })
}

module.exports.resolveOptions = resolveOptions

/**
 * @param {string} url
 * @param {Accumulator} acc
 * @return {string}
 */
function resolveUrlInjections (url, acc) {
  const matches = url.match(/\{(.*?)\}/g) || []
  const injectedUrl = matches.reduce((replacementTarget, match) => {
    const objPath = match.slice(1, -1)
    const value = _.get(acc, objPath, '')
    return replacementTarget.replace(match, value)
  }, url)

  return injectedUrl
}

module.exports.resolveUrlInjections = resolveUrlInjections

/**
 * @param {Accumulator} acc
 * @return {Accumulator}
 */
function resolveUrl (acc) {
  const entity = acc.reducer.spec
  const url = resolveUrlInjections(entity.url, acc)
  return utils.assign(acc, { url })
}

module.exports.resolveUrl = resolveUrl

/**
 * @param {Accumulator} acc
 */
function inspect (acc) {
  if (acc.params && acc.params.inspect) {
    utils.inspect(acc, {
      options: acc.options,
      value: acc.value
    })
  }
}

module.exports.inspect = inspect

/**
 * @param {Object} options
 * @return {Promise}
 */
function _requestReducer (options) {
  return rp(options)
}

// this name will appear in the stack trace when a request fails
Object.defineProperty(_requestReducer, 'name', {
  value: 'request-promise#request'
})

// this function is a reducer so that we can log
// reducer stack traces if the request has an error
const requestReducer = createReducer(_requestReducer)

module.exports.requestReducer = requestReducer

/**
 * @param {Accumulator} accumulator
 * @param {Function} resolveReducer
 * @return {Promise<Accumulator>}
 */
function resolveRequest (accumulator, resolveReducer) {
  inspect(accumulator)
  const acc = utils.set(accumulator, 'value', accumulator.options)
  return resolveReducer(acc, requestReducer)
}

module.exports.resolveRequest = resolveRequest

/**
 * @param {Accumulator} acc
 * @param {Function} resolveReducer
 * @return {Promise<Accumulator>}
 */
function resolve (acc, resolveReducer) {
  const entity = acc.reducer.spec
  return Promise.resolve(acc)
    .then(itemContext => resolveReducer(itemContext, entity.value, [['value']]))
    .then(itemContext => resolveOptions(itemContext, resolveReducer))
    .then(itemContext => resolveRequest(itemContext, resolveReducer))
}

module.exports.resolve = resolve
