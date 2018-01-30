const Promise = require('bluebird')

const utils = require('../../../utils')

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerParallel} reducerParallel
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, resolveReducer, accumulator, reducerParallel) {
  return Promise.map(reducerParallel.reducers, reducer => {
    return resolveReducer(manager, accumulator, reducer)
  }).then(result => {
    const value = result.map(acc => acc.value)
    return utils.assign(accumulator, { value })
  })
}

module.exports.resolve = resolve
