const Promise = require('bluebird')
const set = require('lodash/set')

const { stackPush } = require('../../reducer-stack')
const utils = require('../../utils')

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerObject} reducer
 * @param {Array} stack
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, resolveReducer, accumulator, reducer, stack) {
  if (utils.reducerIsEmpty(reducer)) {
    return Promise.resolve(accumulator)
  }

  return Promise.map(reducer.reducers, ({ reducer, path }) => {
    const _stack = stack ? stackPush(stack, path) : stack
    return resolveReducer(manager, accumulator, reducer, _stack).then(({ value }) => ({
      path,
      value
    }))
  }).then(result => {
    const value = result.reduce(
      (acc, { path, value }) => set(acc, path, value),
      reducer.source()
    )

    return utils.set(accumulator, 'value', value)
  })
}

module.exports.resolve = resolve
