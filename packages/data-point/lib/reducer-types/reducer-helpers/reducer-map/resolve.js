const Promise = require('bluebird')
const utils = require('../../../utils')

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerMap} reducerMap
 * @returns {Promise}
 */
function resolve (manager, resolveReducer, accumulator, reducerMap) {
  const reducer = reducerMap.reducer
  return Promise.map(accumulator.value, itemValue => {
    const itemContext = utils.set(accumulator, 'value', itemValue)
    return resolveReducer(manager, itemContext, reducer)
  })
}

module.exports.resolve = resolve
