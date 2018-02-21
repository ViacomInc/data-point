const Promise = require('bluebird')
const pick = require('lodash/pick')
const utils = require('../../../utils')

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerPick} reducerPick
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, resolveReducer, accumulator, reducerPick) {
  const value = pick(accumulator.value, reducerPick.keys)
  return Promise.resolve(utils.set(accumulator, 'value', value))
}

module.exports.resolve = resolve
