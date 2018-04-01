const Promise = require('bluebird')

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerParallel} reducerParallel
 * @returns {Promise}
 */
function resolve (manager, resolveReducer, accumulator, reducerParallel) {
  return Promise.map(reducerParallel.reducers, reducer => {
    return resolveReducer(manager, accumulator, reducer)
  })
}

module.exports.resolve = resolve
