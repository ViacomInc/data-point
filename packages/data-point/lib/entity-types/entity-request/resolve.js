
const _ = require('lodash')
const fp = require('lodash/fp')
const Promise = require('bluebird')
const rp = require('request-promise')

const utils = require('../../utils')

function resolveUrlInjections (url, acc) {
  const matches = url.match(/\{(.*?)\}/g) || []

  const injectedUrl = _.reduce(
    matches,
    (replacementTarget, match) => {
      const objPath = match.slice(1, -1)
      const value = _.get(acc, objPath, '')
      return replacementTarget.replace(match, value)
    },
    url
  )

  return injectedUrl
}

module.exports.resolveUrlInjections = resolveUrlInjections

function resolveUrl (acc) {
  const entity = acc.reducer.spec
  const url = resolveUrlInjections(entity.url, acc)
  return utils.set(acc, 'url', url)
}

module.exports.resolveUrl = resolveUrl

/**
 * request's default options
 * @type {Object}
 */
const REQUEST_DEFAULT_OPTIONS = {
  method: 'GET',
  json: true
}

function getRequestOptions (specOptions) {
  return _.defaults({}, specOptions, REQUEST_DEFAULT_OPTIONS)
}

module.exports.getRequestOptions = getRequestOptions

/**
 * Resolve options object
 * @param {Accumulator} acc
 * @param {function} resolveReducer
 */
function resolveOptions (acc, resolveReducer) {
  const options = acc.reducer.spec.options
  const transformOptionKeys = acc.reducer.spec.transformOptionKeys
  // iterate over each option transform key
  return Promise.reduce(
    transformOptionKeys,
    (newOptions, key) => {
      return resolveReducer(acc, key.transform).then(res => {
        return fp.set(key.path, res.value, newOptions)
      })
    },
    options
  ).then(resolvedOptions => {
    return utils.set(acc, 'options', resolvedOptions)
  })
}

module.exports.resolveOptions = resolveOptions

function inspect (acc) {
  if (acc.params && acc.params.inspect) {
    utils.inspect(acc, {
      options: acc.options,
      value: acc.value
    })
  }
}
module.exports.inspect = inspect

function resolveBeforeRequest (acc, resolveReducer) {
  const entity = acc.reducer.spec

  let options = getRequestOptions(acc.options)

  options = utils.set(options, 'url', acc.url)

  if (options.baseUrl && !options.uri) {
    options = Object.assign({}, options, {
      uri: acc.url,
      url: ''
    })
  }

  const beforeRequestAcc = utils.set(acc, 'value', options)
  return resolveReducer(beforeRequestAcc, entity.beforeRequest).then(result =>
    utils.set(acc, 'options', result.value)
  )
}

module.exports.resolveBeforeRequest = resolveBeforeRequest

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
