const Promise = require('bluebird')

const utils = require('../../../utils')

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerConstant} reducerConstant
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, resolveReducer, accumulator, reducerConstant) {
  const acc = utils.set(accumulator, 'value', reducerConstant.value)
  return Promise.resolve(acc)
}

module.exports.resolve = resolve
