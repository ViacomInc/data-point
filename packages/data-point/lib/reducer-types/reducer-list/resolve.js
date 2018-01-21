const Promise = require('bluebird')

const { stackPush } = require('../../reducer-stack')

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerList} reducerList
 * @param {Array} stack
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, resolveReducer, accumulator, reducerList, stack) {
  const reducers = reducerList.reducers
  if (reducers.length === 0) {
    return Promise.resolve(accumulator)
  }

  const result = Promise.reduce(
    reducers,
    (accumulator, reducer, index) => {
      const _stack = stack ? stackPush(stack, index) : stack
      return resolveReducer(manager, accumulator, reducer, _stack)
    },
    accumulator
  )

  return result
}

module.exports.resolve = resolve
