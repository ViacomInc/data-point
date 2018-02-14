const Promise = require('bluebird')
const omit = require('lodash/omit')

const utils = require('../../../utils')

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerOmit} reducerOmit
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, resolveReducer, accumulator, reducerOmit) {
  const keys = reducerOmit.keys
  const value = omit(accumulator.value, keys)
  return Promise.resolve(utils.set(accumulator, 'value', value))
}

module.exports.resolve = resolve
