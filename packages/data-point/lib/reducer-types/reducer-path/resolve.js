const Promise = require('bluebird')

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerPath} reducer
 * @returns {Promise}
 */
function resolve (manager, resolveReducer, accumulator, reducer) {
  return Promise.resolve(reducer.body(accumulator))
}

module.exports.resolve = resolve
