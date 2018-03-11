const Promise = require('bluebird')

const utils = require('../../utils')

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerList} reducerList
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, resolveReducer, accumulator, reducerList) {
  const reducers = reducerList.reducers
  if (reducers.length === 0) {
    return Promise.resolve(utils.set(accumulator, 'value', undefined))
  }

  const result = Promise.reduce(
    reducers,
    (accumulator, reducer, index) => {
      return resolveReducer(manager, accumulator, reducer, index)
    },
    accumulator
  )

  return result
}

module.exports.resolve = resolve
