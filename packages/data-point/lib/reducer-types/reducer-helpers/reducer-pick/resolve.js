const Promise = require('bluebird')
const pick = require('lodash/pick')
const utils = require('../../../utils')

/**
 * @param {Object} manager
 * @param {Function} createReducer
 * @param {Accumulator} accumulator
 * @param {ReducerPick} reducerPick
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, createReducer, accumulator, reducerPick) {
  const keys = reducerPick.keys
  if (keys.length === 0) {
    return Promise.resolve(accumulator)
  }

  const value = pick(accumulator.value, keys)
  return Promise.resolve(utils.set(accumulator, 'value', value))
}

module.exports.resolve = resolve
