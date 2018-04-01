const _ = require('lodash')
const utils = require('../../utils')

/**
 * @param {Accumulator} accumulator
 * @param {Function} resolveReducer
 * @return {Promise}
 */
function resolve (accumulator, resolveReducer) {
  const contextTransform = accumulator.reducer.spec.value
  const acc = utils.set(
    accumulator,
    'value',
    _.defaultTo(accumulator.value, {})
  )
  return resolveReducer(acc, contextTransform)
}

module.exports.resolve = resolve
