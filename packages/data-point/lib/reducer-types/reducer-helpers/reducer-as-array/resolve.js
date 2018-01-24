const Promise = require('bluebird')

const utils = require('../../../utils')

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerAsArray} reducerAsArray
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, resolveReducer, accumulator, reducerAsArray) {
  return Promise.map(reducerAsArray.reducers, reducer => {
    return resolveReducer(manager, accumulator, reducer)
  }).then(result => {
    const value = result.map(acc => acc.value)
    return utils.assign(accumulator, { value })
  })
}

module.exports.resolve = resolve
