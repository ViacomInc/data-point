const _ = require('lodash')
const Promise = require('bluebird')
const rp = require('request-promise')

const createReducer = require('../../reducer-types').create
const { stackPush } = require('../../reducer-stack')
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
 * @param {Array} stack
 * @return {Promise<Accumulator>}
 */
function resolveOptions (accumulator, resolveReducer, stack) {
  const options = accumulator.reducer.spec.options
  const _stack = stack ? stackPush(stack, ['options']) : stack
  return resolveReducer(accumulator, options, _stack).then(acc => {
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
 * @param {Array} stack
 * @return {Promise<Accumulator>}
 */
function resolveBeforeRequest (acc, resolveReducer, stack) {
  const entity = acc.reducer.spec
  const options = utils.set(acc.options, 'url', acc.url)
  const beforeRequestAcc = utils.set(acc, 'value', options)
  const _stack = stack ? stackPush(stack, ['beforeRequest']) : stack
  return resolveReducer(beforeRequestAcc, entity.beforeRequest, _stack).then(
    result => utils.set(acc, 'options', result.value)
  )
}

module.exports.resolveBeforeRequest = resolveBeforeRequest

/**
 * @param {Accumulator} accumulator
 * @return {Promise}
 */
function _requestReducer (accumulator) {
  return rp(accumulator.value)
}

// this name will appear in the stack trace when a request fails
Object.defineProperty(_requestReducer, 'name', {
  value: 'request-promise#request'
})

// this function is a reducer so we can spy on the input and
// output to the resolveReducuer function when using debug mode
const requestReducer = createReducer(_requestReducer)

module.exports.requestReducer = requestReducer

/**
 * @param {Accumulator} accumulator
 * @param {Function} resolveReducer
 * @param {Array} stack
 * @return {Promise<Accumulator>}
 */
function resolveRequest (accumulator, resolveReducer, stack) {
  inspect(accumulator)
  const _stack = stack ? stackPush(stack, ['request']) : stack
  // we do not overwrite the value until this
  // point because we might need the previous
  // value when creating the url
  const acc = utils.set(accumulator, 'value', accumulator.options)
  return resolveReducer(acc, requestReducer, _stack).catch(error => {
    const message = [
      'Response info:\n',
      utils.inspectProperties(error, ['message', 'statusCode', 'body'], '  ')
    ].join('')

    // overwrite the header and _message
    error.rvalue.header = 'Request options'
    error._message = message
    throw error
  })
}

module.exports.resolveRequest = resolveRequest

/**
 * @param {Accumulator} accumulator
 * @param {Function} resolveReducer
 * @param {Array}
 * @return {Promise<Accumulator>}
 */
function resolve (accumulator, resolveReducer, stack) {
  const entity = accumulator.reducer.spec
  return Promise.resolve(accumulator)
    .then(acc => {
      const _stack = stack ? stackPush(stack, ['value']) : stack
      return resolveReducer(acc, entity.value, _stack)
    })
    .then(acc => resolveOptions(acc, resolveReducer, stack))
    .then(acc => resolveUrl(acc))
    .then(acc => resolveBeforeRequest(acc, resolveReducer, stack))
    .then(acc => resolveRequest(acc, resolveReducer, stack))
}

module.exports.resolve = resolve
