const Promise = require('bluebird')

const utils = require('../../../utils')

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerMap} reducerMap
 * @param {Array} stack
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, resolveReducer, accumulator, reducerMap, stack) {
  const reducer = reducerMap.reducer
  if (utils.reducerIsEmpty(reducer)) {
    return Promise.resolve(accumulator)
  }

  return Promise.map(accumulator.value, (itemValue, index) => {
    const itemContext = utils.set(accumulator, 'value', itemValue)
    const _stack = stack ? stack.concat(index) : stack
    return resolveReducer(manager, itemContext, reducer, _stack).then(res => {
      return res.value
    })
  }).then(result => utils.set(accumulator, 'value', result))
}

module.exports.resolve = resolve
