const _ = require('lodash')
const fp = require('lodash/fp')
const Promise = require('bluebird')
const rp = require('request-promise')

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
  const url = resolveUrl(accumulator)
  const specOptions = accumulator.reducer.spec.options
  return resolveReducer(accumulator, specOptions).then(acc => {
    const options = getRequestOptions(url, acc.value)
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
  let urlToResolve = acc.reducer.spec.url

  // use acc.value when Request.url is not set
  if (!urlToResolve && typeof acc.value === 'string' && acc.value) {
    urlToResolve = acc.value
  }

  // prevent from executing resolveUrlInjections when
  // urlToResolve is empty string
  return urlToResolve && typeof urlToResolve === 'string'
    ? resolveUrlInjections(urlToResolve, acc)
    : undefined
}

module.exports.resolveUrl = resolveUrl

/**
 * @param {Function} callback
 * @returns {Function} a new callback, that calls the original one
 */
function getRequestPromiseWithDebugging (callback) {
  const debugModule = require('request-debug')
  delete require.cache['request-promise']
  const rpDebug = require('request-promise')
  delete require.cache['request-promise']
  if (callback) {
    debugModule(rpDebug, callback)
  } else {
    debugModule(rpDebug)
  }
  return rpDebug
}

module.exports.getRequestPromiseWithDebugging = getRequestPromiseWithDebugging

/**
 * @param {Function} requestFn - default request-promise function
 * @param {Accumulator} acc
 * @returns {Function} request-promise function, with
 *                     optional debugging attached
 */
function inspect (requestFn, acc) {
  const paramInspect = acc.params && acc.params.inspect
  const isFunction = typeof paramInspect === 'function'
  if (isFunction) {
    paramInspect(acc)
  }

  if (acc.params && acc.params.requestDebug === true) {
    let callback
    if (isFunction) {
      // This will register params.inspect as a callback
      // for the request-debug library, so it will be
      // called like this: inspect(acc[, type, data, r])
      callback = (...args) => paramInspect(acc, ...args)
    }
    // If the callback is undefined, then request-debug will be
    // initialized to log data when requests are made and received
    requestFn = getRequestPromiseWithDebugging(callback)
  }

  if (paramInspect === true) {
    utils.inspect(acc, {
      options: acc.options,
      value: acc.value
    })
  }

  return requestFn
}

module.exports.inspect = inspect

/**
 * @param {Accumulator} acc
 * @param {Function} resolveReducer
 * @return {Promise<Accumulator>}
 */
function resolveRequest (acc, resolveReducer) {
  const _request = inspect(rp, acc)
  return _request(acc.options)
    .then(result => utils.set(acc, 'value', result))
    .catch(error => {
      // remove auth objects from acc and error for printing to console
      const redactedAcc = fp.set('options.auth', '[omitted]', acc)
      const redactedError = fp.set('options.auth', '[omitted]', error)

      const message = [
        'Entity info:',
        '\n  - Id: ',
        _.get(redactedAcc, 'reducer.spec.id'),
        '\n',
        utils.inspectProperties(
          redactedAcc,
          ['options', 'params', 'value'],
          '  '
        ),
        '\n  Request:\n',
        utils.inspectProperties(
          redactedError,
          ['error', 'message', 'statusCode', 'options', 'body'],
          '  '
        )
      ].join('')

      // attaching to error so it can be exposed by a handler outside datapoint
      error.message = `${error.message}\n\n${message}`
      throw error
    })
    .finally(() => {
      // request-debug adds this function
      if (typeof _request.stopDebugging === 'function') {
        _request.stopDebugging()
      }
    })
}

module.exports.resolveRequest = resolveRequest

/**
 * @param {Accumulator} acc
 * @param {Function} resolveReducer
 * @return {Promise<Accumulator>}
 */
function resolve (acc, resolveReducer) {
  return Promise.resolve(acc)
    .then(itemContext => resolveOptions(itemContext, resolveReducer))
    .then(itemContext => resolveRequest(itemContext, resolveReducer))
}

module.exports.resolve = resolve
