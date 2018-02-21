const _ = require('lodash')
const utils = require('../../utils')

/**
 * @param {Accumulator} acc
 * @param {Function} resolveReducer
 * @return {Promise}
 */
function resolve (acc, resolveReducer) {
  const contextTransform = acc.reducer.spec.value
  const racc = utils.set(acc, 'value', _.defaultTo(acc.value, {}))
  return resolveReducer(racc, contextTransform, [['value']])
}

module.exports.resolve = resolve
