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
 * @param {Array} stack
 * @return {Promise<Accumulator>}
 */
function resolveOptions (accumulator, resolveReducer, stack) {
  accumulator = resolveUrl(accumulator)
  const specOptions = accumulator.reducer.spec.options
  const _stack = stack ? stackPush(stack, ['options']) : stack
  return resolveReducer(accumulator, specOptions, _stack).then(acc => {
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
  // we don't overwrite the value until this
  // point because we might need the previous
  // value when creating the url
  const acc = utils.set(accumulator, 'value', accumulator.options)
  return resolveReducer(acc, requestReducer, _stack).catch(error => {
    const message = [
      'Response info:\n',
      utils.inspectProperties(error, ['message', 'statusCode', 'body'], '  ')
    ].join('')

    error.rvalue.header = 'Request options'
    error._message = message
    throw error
  })
}

module.exports.resolveRequest = resolveRequest

/**
 * @param {Accumulator} accumulator
 * @param {Function} resolveReducer
 * @param {Array} stack
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
    .then(acc => resolveRequest(acc, resolveReducer, stack))
}

module.exports.resolve = resolve
