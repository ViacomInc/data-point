const Promise = require('bluebird')
const omit = require('lodash/omit')

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerOmit} reducerOmit
 * @returns {Promise}
 */
function resolve (manager, resolveReducer, accumulator, reducerOmit) {
  return Promise.resolve(omit(accumulator.value, reducerOmit.keys))
}

module.exports.resolve = resolve
