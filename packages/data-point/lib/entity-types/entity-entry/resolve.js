const defaultTo = require('lodash/defaultTo')

/**
 * @param {Accumulator} accumulator
 * @param {Function} resolveReducer
 * @return {Promise}
 */
function resolve (accumulator, resolveReducer) {
  return defaultTo(accumulator.value, {})
}

module.exports.resolve = resolve
