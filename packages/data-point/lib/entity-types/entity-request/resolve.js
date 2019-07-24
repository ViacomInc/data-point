const _ = require('lodash')
const fp = require('lodash/fp')
const Promise = require('bluebird')
const rp = require('request-promise')

const utils = require('../../utils')

let debugIdCounter = 0

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
  return resolveReducer(accumulator, specOptions).then(value => {
    const options = getRequestOptions(url, value)
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
 * @param {Accumulator} acc
 */
function inspect (acc, request) {
  const paramInspect = acc.params && acc.params.inspect
  if (paramInspect === true) {
    utils.inspect(acc, {
      options: acc.options,
      value: acc.value
    })
    return true
  }

  if (typeof paramInspect === 'function') {
    // some of this logic borrows from https://github.com/request/request-debug
    const debugId = ++debugIdCounter
    const data = {
      debugId,
      type: 'request',
      uri: request.uri.href,
      method: request.method,
      headers: _.cloneDeep(request.headers)
    }
    if (request.body) {
      data.body = request.body.toString('utf8')
    }
    _.attempt(paramInspect, acc, data)
    // This promise chain should not be returned,
    // because it is only being used to trigger
    // the paramInspect callback
    request
      .then(res => {
        _.attempt(paramInspect, acc, {
          debugId,
          type: 'response',
          statusCode: res.statusCode,
          headers: res.headers
        })
      })
      .catch(error => {
        _.attempt(paramInspect, acc, {
          debugId,
          type: 'error',
          statusCode: error.statusCode,
          headers: error.headers
        })
      })
    return true
  }

  return false
}

module.exports.inspect = inspect

/**
 * @param {Accumulator} acc
 * @param {Function} resolveReducer
 * @return {Promise<Accumulator>}
 */
function resolveRequest (acc, resolveReducer) {
  const options = Object.assign({}, acc.options, {
    resolveWithFullResponse: true
  })

  const request = rp(options)
  inspect(acc, request)
  return request
    .then(res => res.body)
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
