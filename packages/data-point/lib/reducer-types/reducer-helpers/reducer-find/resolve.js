const Promise = require('bluebird')

const utils = require('../../../utils')
const { stackPush } = require('../../../reducer-stack')

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerFind} reducerFind
 * @param {Array} stack
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, resolveReducer, accumulator, reducerFind, stack) {
  const reducer = reducerFind.reducer
  if (utils.reducerIsEmpty(reducer)) {
    return Promise.resolve(accumulator)
  }

  return Promise.reduce(
    accumulator.value,
    (result, itemValue, index) => {
      const itemContext = utils.set(accumulator, 'value', itemValue)
      const _stack = stack ? stackPush(stack, index) : stack
      return (
        result ||
        resolveReducer(manager, itemContext, reducer, _stack).then(res => {
          return res.value ? itemValue : undefined
        })
      )
    },
    null
  ).then(result => utils.set(accumulator, 'value', result))
}

module.exports.resolve = resolve
