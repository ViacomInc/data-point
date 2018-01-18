const Promise = require('bluebird')

const utils = require('../../utils')

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerPath} reducer
 * @param {Array} stack
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, resolveReducer, accumulator, reducer, stack) {
  const value = reducer.body(accumulator)
  const acc = utils.set(accumulator, 'value', value)
  return Promise.resolve(acc)
}

module.exports.resolve = resolve
