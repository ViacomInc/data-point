const Promise = require('bluebird')
const utils = require('../../../utils')

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerMap} reducerMap
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, resolveReducer, accumulator, reducerMap) {
  const reducer = reducerMap.reducer
  return Promise.map(accumulator.value, (itemValue, index) => {
    const itemContext = utils.set(accumulator, 'value', itemValue)
    return resolveReducer(manager, itemContext, reducer, index).then(res => {
      return res.value
    })
  }).then(result => utils.set(accumulator, 'value', result))
}

module.exports.resolve = resolve
