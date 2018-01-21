const _ = require('lodash')

const utils = require('../../utils')
const { stackPush } = require('../../reducer-stack')

/**
 * @param {Accumulator} acc
 * @param {Function} resolveReducer
 * @param {Array} stack
 * @returns {Promise<Accumulator>}
 */
function resolve (acc, resolveReducer, stack) {
  const contextTransform = acc.reducer.spec.value
  const racc = utils.set(acc, 'value', _.defaultTo(acc.value, {}))
  const _stack = stack ? stackPush(stack, ['value']) : stack
  return resolveReducer(racc, contextTransform, _stack)
}

module.exports.resolve = resolve
