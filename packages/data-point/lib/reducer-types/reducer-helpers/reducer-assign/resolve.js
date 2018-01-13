const utils = require('../../../utils')
const { getErrorHandler } = require('../../reducer-stack')
const REDUCER_ASSIGN = require('./type')

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerAssign} reducerAssign
 * @param {Array} stack
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, resolveReducer, accumulator, reducerAssign, stack) {
  const reducer = reducerAssign.reducer
  const _stack = stack ? stack.concat(REDUCER_ASSIGN) : stack
  return resolveReducer(manager, accumulator, reducer, _stack)
    .then(acc => {
      const value = Object.assign({}, accumulator.value, acc.value)
      return utils.set(accumulator, 'value', value)
    })
    .catch(getErrorHandler(_stack))
}

module.exports.resolve = resolve
