const _ = require('lodash')
const utils = require('../../utils')

/**
 * @param {Accumulator} acc
 * @param {Function} resolveReducer
 * @param {Array} stack
 * @returns {Promise<Accumulator>}
 */
function resolve (acc, resolveReducer, stack) {
  const contextTransform = acc.reducer.spec.value
  const racc = utils.set(acc, 'value', _.defaultTo(acc.value, {}))
  return resolveReducer(racc, contextTransform, stack)
}

module.exports.resolve = resolve
