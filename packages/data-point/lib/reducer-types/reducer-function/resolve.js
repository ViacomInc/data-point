const Promise = require('bluebird')

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerObject} reducer
 * @returns {Promise}
 */
function resolve (manager, resolveReducer, accumulator, reducer) {
  return Promise.try(() => reducer.body(accumulator.value, accumulator))
}

module.exports.resolve = resolve
