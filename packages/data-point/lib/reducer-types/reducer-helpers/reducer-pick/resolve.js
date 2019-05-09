const Promise = require('bluebird')
const pick = require('lodash/pick')

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerPick} reducerPick
 * @returns {Promise}
 */
function resolve (manager, resolveReducer, accumulator, reducerPick) {
  return Promise.resolve(pick(accumulator.value, reducerPick.keys))
}

module.exports.resolve = resolve
