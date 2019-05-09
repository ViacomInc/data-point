const Promise = require('bluebird')

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerConstant} reducerConstant
 * @returns {Promise}
 */
function resolve (manager, resolveReducer, accumulator, reducerConstant) {
  return Promise.resolve(reducerConstant.value)
}

module.exports.resolve = resolve
