const Promise = require('bluebird')

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
    return Promise.resolve(accumulator)
  }

  const result = Promise.reduce(
    reducers,
    (accumulator, reducer) => {
      return resolveReducer(manager, accumulator, reducer)
    },
    accumulator
  )

  return result
}

module.exports.resolve = resolve
