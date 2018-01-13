const Promise = require('bluebird')

const utils = require('../../../utils')
const { getErrorHandler } = require('../../reducer-stack')

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerFilter} reducerFilter
 * @param {Array} stack
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, resolveReducer, accumulator, reducerFilter, stack) {
  const reducer = reducerFilter.reducer
  if (utils.reducerIsEmpty(reducer)) {
    return Promise.resolve(accumulator)
  }

  return Promise.filter(accumulator.value, (itemValue, index) => {
    const itemContext = utils.set(accumulator, 'value', itemValue)
    const _stack = stack ? stack.concat(index) : stack
    return resolveReducer(manager, itemContext, reducer, _stack)
      .then(res => !!res.value)
      .catch(getErrorHandler(_stack))
  })
    .then(result => utils.set(accumulator, 'value', result))
    .catch(getErrorHandler(stack))
}

module.exports.resolve = resolve
