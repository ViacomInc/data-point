const _ = require('lodash')
const Promise = require('bluebird')

const Reducer = require('../reducer-types')
const AccumulatorFactory = require('../accumulator/factory')
const { stringifyReducerStack } = require('../debug-utils')

/**
 * @param {Object} spec
 * @return {Object}
 */
function getOptions (spec) {
  return _.defaults({}, spec, {
    locals: {}
  })
}

/**
 * @param {Object} manager
 * @param {*} reducerSource
 * @param {*} value
 * @param {Object} options
 * @return {Promise}
 */
function reducerResolve (manager, reducerSource, value, options) {
  const contextOptions = getOptions(options)
  const accumulator = AccumulatorFactory.create({
    value: value,
    locals: contextOptions.locals,
    trace: contextOptions.trace,
    values: manager.values.getStore()
  })

  const reducer = Reducer.create(reducerSource)
  return Reducer.resolve(manager, accumulator, reducer).catch(error => {
    if (error._stack) {
      error._message = `The following reducer failed to execute:\n${stringifyReducerStack(error._stack)}`
      delete error._stack
    }

    throw error
  })
}

/**
 * @param {Object} manager
 * @param {*} reducerSource
 * @param {*} value
 * @param {Object} options
 * @param {Function} done
 * @return {Promise}
 */
function transform (manager, reducerSource, value, options, done) {
  return Promise.resolve()
    .then(() => reducerResolve(manager, reducerSource, value, options))
    .asCallback(done)
}

module.exports.transform = transform

/**
 * @param {Object} manager
 * @param {*} reducerSource
 * @param {*} value
 * @param {Object} options
 * @return {Promise}
 */
function resolve (manager, reducerSource, value, options) {
  return Promise.resolve()
    .then(() => reducerResolve(manager, reducerSource, value, options))
    .then(acc => acc.value)
}

module.exports.resolve = _.curry(resolve, 3)
