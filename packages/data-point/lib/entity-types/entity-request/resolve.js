const _ = require('lodash')
const fp = require('lodash/fp')
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
  accumulator = resolveUrl(accumulator)
  const specOptions = accumulator.reducer.spec.options
  return resolveReducer(accumulator, specOptions).then(value => {
    const options = getRequestOptions(accumulator.url, value)
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
 * @param {Accumulator} acc
 * @return {Promise}
 */
function resolveRequest (acc) {
  inspect(acc)
  return rp(acc.options).catch(error => {
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
 * @return {Promise}
 */
function resolve (acc, resolveReducer) {
  const entity = acc.reducer.spec
  return resolveReducer(acc, entity.value)
    .then(value => {
      return resolveOptions(utils.set(acc, 'value', value), resolveReducer)
    })
    .then(itemContext => resolveRequest(itemContext))
}

module.exports.resolve = resolve
