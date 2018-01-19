const _ = require('lodash')
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
 * @param {Object} specOptions
 * @return {Object}
 */
function getRequestOptions (specOptions) {
  return _.defaults({}, specOptions, REQUEST_DEFAULT_OPTIONS)
}

module.exports.getRequestOptions = getRequestOptions

/**
 * Resolve options object
 * @param {Accumulator} accumulator
 * @param {Function} resolveReducer
 * @return {Promise<Accumulator>}
 */
function resolveOptions (accumulator, resolveReducer) {
  const options = accumulator.reducer.spec.options
  return resolveReducer(accumulator, options).then(acc => {
    const resolvedOptions = getRequestOptions(acc.value)
    if (resolvedOptions.baseUrl && !resolvedOptions.uri) {
      resolvedOptions.uri = acc.url
      resolvedOptions.url = ''
    }

    return utils.set(accumulator, 'options', resolvedOptions)
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
  return utils.set(acc, 'url', url)
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
 * @param {Accumulator} acc
 * @param {Function} resolveReducer
 * @return {Promise<Accumulator>}
 */
function resolveBeforeRequest (acc, resolveReducer) {
  const entity = acc.reducer.spec
  const options = utils.set(acc.options, 'url', acc.url)
  const beforeRequestAcc = utils.set(acc, 'value', options)
  return resolveReducer(beforeRequestAcc, entity.beforeRequest).then(result =>
    utils.set(acc, 'options', result.value)
  )
}

module.exports.resolveBeforeRequest = resolveBeforeRequest

/**
 * @param {Accumulator} acc
 * @param {Function} resolveReducer
 * @return {Promise<Accumulator>}
 */
function resolveRequest (acc, resolveReducer) {
  inspect(acc)
  return rp(acc.options)
    .then(result => utils.set(acc, 'value', result))
    .catch(error => {
      const message = [
        'Entity info:',
        '\n  - Id: ',
        _.get(acc, 'reducer.spec.id'),
        '\n',
        utils.inspectProperties(acc, ['options', 'params', 'value'], '  '),
        '\n  Request:\n',
        utils.inspectProperties(
          error,
          ['error', 'message', 'statusCode', 'options', 'body'],
          '  '
        )
      ].join('')

      // this is useful in the case the error itself is not logged by the
      // implementation
      console.info(error.toString(), message)

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
  const entity = acc.reducer.spec
  return Promise.resolve(acc)
    .then(itemContext => resolveReducer(itemContext, entity.value))
    .then(itemContext => resolveOptions(itemContext, resolveReducer))
    .then(itemContext => resolveUrl(itemContext))
    .then(itemContext => resolveBeforeRequest(itemContext, resolveReducer))
    .then(itemContext => resolveRequest(itemContext, resolveReducer))
}

module.exports.resolve = resolve
