const Promise = require('bluebird')
const omit = require('lodash/omit')

const utils = require('../../../utils')

/**
 * @param {Object} manager
 * @param {Function} createReducer
 * @param {Accumulator} accumulator
 * @param {ReducerOmit} reducerOmit
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, createReducer, accumulator, reducerOmit) {
  const keys = reducerOmit.keys
  if (keys.length === 0) {
    return Promise.resolve(accumulator)
  }

  const value = omit(accumulator.value, keys)
  return Promise.resolve(utils.set(accumulator, 'value', value))
}

module.exports.resolve = resolve