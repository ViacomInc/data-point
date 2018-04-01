const _ = require('lodash')
const Promise = require('bluebird')

const Reducer = require('../reducer-types')
const AccumulatorFactory = require('../accumulator/factory')
const utils = require('../utils')

/**
 * @param {Object} manager
 * @param {*} value
 * @param {Object} options
 * @return {Object}
 */
function getAccumulator (manager, value, options = {}) {
  return AccumulatorFactory.create({
    value,
    locals: options.locals || {},
    trace: options.trace || false,
    values: manager.values.getStore()
  })
}

/**
 * @param {Object} manager
 * @param {*} reducerSource
 * @param {Object} accumulator
 * @return {Promise}
 */
function reducerResolve (manager, reducerSource, accumulator) {
  return Promise.try(() => {
    const reducer = Reducer.create(reducerSource)
    return Reducer.resolve(manager, accumulator, reducer)
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
  const accumulator = getAccumulator(manager, value, options)
  return reducerResolve(manager, reducerSource, accumulator)
    .then(value => utils.set(accumulator, 'value', value))
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
  const accumulator = getAccumulator(manager, value, options)
  return reducerResolve(manager, reducerSource, accumulator)
}

module.exports.resolve = _.curry(resolve, 3)
